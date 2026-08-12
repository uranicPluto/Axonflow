import crypto from "node:crypto";
import { db } from "./db";
import { logError } from "./error-logger";
import { sanitizeData } from "./sanitize";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_WEBHOOK_BYTES = 256 * 1024; // 256 KB hard limit

const SUPPORTED_EVENTS = new Set([
  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
]);

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Normalise an incoming Cal.com signature header.
 * Accepts both `sha256=<hex>` (with prefix) and bare `<hex>`.
 * Returns the raw hex string or null if the input is absent.
 */
function normaliseSignature(raw: string | null): string | null {
  if (!raw) return null;
  const stripped = raw.startsWith("sha256=") ? raw.slice(7) : raw;
  return stripped.trim() || null;
}

/**
 * Validate that a string is a non-empty, even-length hex string.
 */
function isValidHex(value: string): boolean {
  return value.length > 0 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);
}

/**
 * Compute HMAC-SHA256 of rawBody using secret and return hex string.
 */
function computeHmac(secret: string, rawBody: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

/**
 * Timing-safe comparison of two hex strings.
 * Returns false for any malformed, mismatched-length, or non-hex input.
 */
function verifyHmacHex(received: string, expected: string): boolean {
  if (!isValidHex(received) || !isValidHex(expected)) return false;
  if (received.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Validate the top-level Cal.com webhook structure.
 * Returns a user-safe error string or null if valid.
 */
function validateWebhookStructure(payload: any): string | null {
  if (!payload || typeof payload !== "object") {
    return "Invalid payload: expected JSON object";
  }

  const { eventTrigger, payload: inner } = payload;

  if (!eventTrigger || typeof eventTrigger !== "string") {
    return "Invalid payload: missing eventTrigger";
  }

  if (!SUPPORTED_EVENTS.has(eventTrigger)) {
    return `Invalid payload: unsupported eventTrigger '${eventTrigger}'`;
  }

  if (!inner || typeof inner !== "object") {
    return "Invalid payload: missing payload body";
  }

  // Require a booking identifier on every event
  const bookingId = inner.bookingId ?? inner.id ?? inner.uid;
  if (bookingId === undefined || bookingId === null) {
    return "Invalid payload: missing booking identifier (bookingId / id / uid)";
  }

  // BOOKING_CREATED requires attendee information
  if (eventTrigger === "BOOKING_CREATED") {
    if (
      !Array.isArray(inner.attendees) ||
      inner.attendees.length === 0 ||
      !inner.attendees[0]?.email
    ) {
      return "Invalid payload: BOOKING_CREATED requires at least one attendee with an email";
    }
  }

  return null; // valid
}

// ─── Public handler ───────────────────────────────────────────────────────────

/**
 * Pure Cal.com webhook handler — no framework dependencies.
 * Safe to import directly in the Node.js test runner.
 *
 * Security boundary enforced here:
 *   1. Request size limit (256 KB)
 *   2. HMAC-SHA256 signature verification using raw bytes (fail-closed)
 *   3. Payload structure validation before any business logic
 *   4. Sanitised error responses (no internals exposed to caller)
 */
export async function handleCalcomWebhook(request: Request): Promise<Response> {
  // ── 1. Request size limit ──────────────────────────────────────────────────
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_WEBHOOK_BYTES) {
    return jsonResponse({ error: "Webhook payload too large" }, 413);
  }

  // ── 2. Read raw body (single read — exact bytes for HMAC) ─────────────────
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({ error: "Failed to read request body" }, 400);
  }

  // Secondary size guard (in case Content-Length header was absent/spoofed)
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BYTES) {
    return jsonResponse({ error: "Webhook payload too large" }, 413);
  }

  // ── 3. Signature verification ─────────────────────────────────────────────
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  // Only NODE_ENV=test triggers bypass — NO generic env-var escape hatch
  const isTestMode = process.env.NODE_ENV === "test";

  if (!secret && isProduction) {
    // Fail closed — never silently downgrade
    console.error("[calcom-webhook] FAIL CLOSED: CAL_WEBHOOK_SECRET missing in production.");
    return jsonResponse({ error: "Webhook configuration error" }, 500);
  }

  if (!isTestMode || secret) {
    // Enforce signature whenever: (a) not in test mode, OR (b) secret is configured (test with sig)
    const rawSig = request.headers.get("x-cal-signature-256") ??
                   request.headers.get("X-Cal-Signature-256");
    const normSig = normaliseSignature(rawSig);

    if (!normSig) {
      console.warn("[calcom-webhook] Rejected: missing signature header.");
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (!secret) {
      // Secret absent but not production and not test — deny
      console.error("[calcom-webhook] Secret missing while signature verification is required.");
      return jsonResponse({ error: "Webhook configuration error" }, 500);
    }

    const expected = computeHmac(secret, rawBody);
    if (!verifyHmacHex(normSig, expected)) {
      console.warn("[calcom-webhook] Rejected: signature mismatch.");
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  }

  // ── 4. Parse JSON ──────────────────────────────────────────────────────────
  let parsedPayload: any;
  try {
    parsedPayload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Malformed JSON payload" }, 400);
  }

  // ── 5. Structure validation ────────────────────────────────────────────────
  const structureError = validateWebhookStructure(parsedPayload);
  if (structureError) {
    return jsonResponse({ error: structureError }, 400);
  }

  // ── 6. Business logic (idempotent) ─────────────────────────────────────────
  try {
    const result = await db.processCalcomBooking(parsedPayload);

    return jsonResponse(result, 200);
  } catch (err: any) {
    // Log the real error internally — never expose it to the caller
    const sanitised = sanitizeData({ message: err?.message, stack: err?.stack });
    console.error("[calcom-webhook] Processing error:", sanitised);

    await logError({
      service_name: "webhook",
      operation: "calcom_webhook_post",
      error_code: "WEBHOOK_PROCESSING_ERROR",
      error_message: err?.message ?? "Unknown error",
      context: sanitised,
    }).catch(() => {/* swallow logger errors so we still respond */});

    return jsonResponse({ error: "Webhook processing failed" }, 500);
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
