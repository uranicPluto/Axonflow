/**
 * Centralized Error Logging Service with Secret Sanitization
 * Records system exceptions, API failures, and runtime errors into error_logs table.
 */

import { isSupabaseEnabled, supabaseAdmin } from "./supabase";
import { sanitizeData } from "./sanitize";
import { captureSentryException } from "./sentry";
import { getOrCreateRequestId } from "./correlation";

export interface ErrorLogParams {
  severity: "info" | "warning" | "error" | "critical";
  component: string;
  errorMessage: string;
  stackTrace?: string;
  context?: Record<string, any>;
  leadId?: string;
  requestId?: string;
}

export async function logError(params: ErrorLogParams): Promise<boolean> {
  const reqId = params.requestId || (await getOrCreateRequestId());
  const sanitizedMessage = sanitizeData(params.errorMessage);
  const sanitizedStack = sanitizeData(params.stackTrace || (new Error().stack || ""));
  const rawContext = { ...(params.context || {}), request_id: reqId };
  const sanitizedContext = sanitizeData(rawContext);

  const entry = {
    id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    severity: params.severity,
    component: params.component,
    error_message: sanitizedMessage,
    stack_trace: sanitizedStack,
    context: JSON.stringify(sanitizedContext),
    lead_id: params.leadId || null,
    created_at: new Date().toISOString(),
  };

  try {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin.from("error_logs").insert([entry]);
      if (error) {
        console.error("Failed to insert into error_logs table:", error);
      }
    } else {
      if (!(globalThis as any).__errorLogStore) {
        (globalThis as any).__errorLogStore = [];
      }
      ((globalThis as any).__errorLogStore as Array<any>).unshift(entry);
    }

    // Capture exception in Sentry if SENTRY_DSN is configured
    if (params.severity === "error" || params.severity === "critical") {
      captureSentryException(params.errorMessage, {
        component: params.component,
        severity: params.severity,
        leadId: params.leadId,
        extra: params.context,
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    console.error("Critical failure writing error log:", err);
    return false;
  }
}
