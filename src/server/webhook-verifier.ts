/**
 * Reusable Webhook Verification & Idempotency Framework with Secret Sanitization
 * Verifies webhook signatures (HMAC-SHA256) and prevents duplicate execution via webhook_events table.
 */

import crypto from "node:crypto";
import { isSupabaseEnabled, supabaseAdmin } from "./supabase";
import { sanitizeData } from "./sanitize";

export interface WebhookRecordParams {
  provider: "calcom" | "aisensy" | "bolna" | "sarvam" | "supabase" | "generic";
  providerEventId: string;
  eventType: string;
  payload: Record<string, any> | string;
  status: "received" | "processed" | "failed";
  errorMessage?: string;
}

/**
 * Verify HMAC-SHA256 signature for incoming webhooks
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!secret || !signatureHeader || !rawBody) {
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    const expectedSignature = hmac.update(rawBody).digest("hex");

    // Support signatures with prefix like 'sha256=' or raw hex
    const normalizedSignature = signatureHeader.startsWith("sha256=")
      ? signatureHeader.substring(7)
      : signatureHeader;

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(normalizedSignature)
    );
  } catch (err) {
    return false;
  }
}

/**
 * Check if a webhook event was already processed (Idempotency check)
 */
export async function checkWebhookIdempotency(
  provider: string,
  providerEventId: string
): Promise<{ isDuplicate: boolean; existingStatus?: string }> {
  if (!providerEventId) {
    return { isDuplicate: false };
  }

  if (isSupabaseEnabled && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("webhook_events")
      .select("id, status")
      .eq("provider", provider)
      .eq("provider_event_id", providerEventId)
      .single();

    if (data) {
      return { isDuplicate: true, existingStatus: data.status };
    }
  } else {
    const store = (globalThis as any).__webhookStore as Array<any> | undefined;
    if (store) {
      const match = store.find((w) => w.provider === provider && w.provider_event_id === providerEventId);
      if (match) {
        return { isDuplicate: true, existingStatus: match.status };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Record a webhook event in the database for auditability and idempotency
 */
export async function recordWebhookEvent(params: WebhookRecordParams): Promise<boolean> {
  const sanitizedPayload = sanitizeData(params.payload);
  const sanitizedErrorMessage = params.errorMessage ? sanitizeData(params.errorMessage) : null;

  const entry = {
    id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    provider: params.provider,
    provider_event_id: params.providerEventId,
    event_type: params.eventType,
    payload: typeof sanitizedPayload === "object" ? JSON.stringify(sanitizedPayload) : sanitizedPayload,
    status: params.status,
    error_message: sanitizedErrorMessage,
    processed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  try {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin.from("webhook_events").upsert(entry, {
        onConflict: "provider,provider_event_id",
      });
      if (error) {
        console.error("Failed to insert into webhook_events:", error);
      }
    } else {
      if (!(globalThis as any).__webhookStore) {
        (globalThis as any).__webhookStore = [];
      }
      ((globalThis as any).__webhookStore as Array<any>).unshift(entry);
    }
    return true;
  } catch (err) {
    console.error("Error recording webhook event:", err);
    return false;
  }
}
