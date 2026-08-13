import crypto from "node:crypto";
import { sanitizeData } from "../sanitize";
import { dispatchCriticalAlert } from "../alerting";

/**
 * Timing-safe comparison of strings to prevent side-channel timing attacks.
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Handler for POST /api/internal/n8n-alert
 * Secure internal alert endpoint allowing n8n workflows to notify AxonFlow of failures
 * without exposing Slack webhook URLs or credentials in n8n Cloud.
 */
export async function handleN8nAlertRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Authenticate n8n via x-n8n-alert-secret header
  const suppliedSecret = request.headers.get("x-n8n-alert-secret") ?? request.headers.get("X-N8n-Alert-Secret");
  const expectedSecret = process.env.N8N_ALERT_SECRET;

  const isProduction = (process.env.NODE_ENV || "production") === "production";

  if (!expectedSecret) {
    if (isProduction) {
      console.error("[N8N_ALERT] Fail closed: N8N_ALERT_SECRET is not configured in environment.");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (!suppliedSecret || !expectedSecret || !timingSafeCompare(suppliedSecret, expectedSecret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Parse payload
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!payload || typeof payload !== "object") {
    return new Response(JSON.stringify({ error: "Invalid payload: expected JSON object" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { severity, title, message, context } = payload;

  if (!title || typeof title !== "string" || !title.trim()) {
    return new Response(JSON.stringify({ error: "Validation failed: title is required and must be a non-empty string" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return new Response(JSON.stringify({ error: "Validation failed: message is required and must be a non-empty string" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validSeverity = severity === "critical" ? "critical" : "warning";

  // 3. Sanitize payload
  const sanitizedTitle = sanitizeData(title.trim());
  const sanitizedMessage = sanitizeData(message.trim());
  const sanitizedContext = context ? sanitizeData(context) : undefined;

  // 4. Dispatch alert
  const alertResult = await dispatchCriticalAlert({
    severity: validSeverity,
    title: sanitizedTitle,
    message: sanitizedMessage,
    context: sanitizedContext,
    timestamp: new Date().toISOString(),
  });

  return new Response(
    JSON.stringify({
      success: true,
      dispatchedCount: alertResult.dispatchedCount,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
