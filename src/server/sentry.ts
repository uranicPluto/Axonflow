/**
 * Server-side Sentry APM Error Tracking Integration
 * Captures unhandled exceptions and logs context when SENTRY_DSN is configured.
 */

import { sanitizeData } from "./sanitize";

export interface SentryEventContext {
  component?: string;
  severity?: string;
  leadId?: string;
  extra?: Record<string, any>;
}

let isSentryInitialized = false;

/**
 * Initialize Sentry SDK dynamically if SENTRY_DSN is set in environment
 */
export async function initSentry(): Promise<boolean> {
  if (isSentryInitialized) return true;

  const dsn = typeof process !== "undefined" && process.env ? process.env.SENTRY_DSN : undefined;
  if (!dsn) {
    return false;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn: dsn,
      environment: process.env.NODE_ENV || "production",
      tracesSampleRate: 0.1,
    });
    isSentryInitialized = true;
    console.log("[SENTRY] APM Error Tracking Initialized Successfully.");
    return true;
  } catch (err) {
    console.warn("[SENTRY] @sentry/node package not loaded or failed to initialize:", err);
    return false;
  }
}

/**
 * Capture an exception in Sentry with sanitized contextual attributes
 */
export async function captureSentryException(error: Error | string, context?: SentryEventContext): Promise<string | null> {
  const dsn = typeof process !== "undefined" && process.env ? process.env.SENTRY_DSN : undefined;
  if (!dsn) return null;

  try {
    await initSentry();
    const Sentry = await import("@sentry/node");

    const sanitizedContext = context ? sanitizeData(context) : {};
    
    let eventId: string;
    Sentry.withScope((scope) => {
      if (context?.component) scope.setTag("component", context.component);
      if (context?.severity) scope.setTag("severity", context.severity);
      if (context?.leadId) scope.setUser({ id: context.leadId });
      if (context?.extra) scope.setExtras(sanitizedContext.extra || {});

      if (typeof error === "string") {
        eventId = Sentry.captureMessage(sanitizeData(error));
      } else {
        eventId = Sentry.captureException(error);
      }
    });

    return eventId! || "captured";
  } catch (err) {
    console.error("[SENTRY] Failed to capture exception:", err);
    return null;
  }
}
