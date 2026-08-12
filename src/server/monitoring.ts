/**
 * Production Observability & Monitoring Engine
 * Implements logic for /api/health and /api/metrics endpoints.
 */

import { isSupabaseEnabled, supabaseAdmin, getSupabaseAdmin } from "./supabase";
import { db } from "./db";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  database: "connected" | "disconnected" | "mock_mode";
  environment: string;
  uptimeSeconds: number;
  error?: string;
}

export interface MetricsResult {
  totalLeads: number;
  totalCalls: number;
  totalWebhookFailures: number;
  totalErrors: number;
  totalRateLimitEvents: number;
  totalBreaches: number;
  timestamp: string;
}

/**
 * Returns a live snapshot of the Supabase state.
 * In tests: override process.env.SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY to control the result.
 * In production: values are read dynamically at request time.
 */
function getSupabaseState(): {
  enabled: boolean;
  client: typeof supabaseAdmin;
} {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  const runtimeEnabled = url !== "" && (serviceKey !== "" || anonKey !== "");
  const runtimeClient = runtimeEnabled ? (getSupabaseAdmin() ?? supabaseAdmin) : null;

  return { enabled: runtimeEnabled, client: runtimeClient };
}

export interface HealthCheckOverride {
  /** If set, overrides the Supabase enabled/client state. For testing only. */
  enabled: boolean;
  client: { from: (table: string) => { select: (...args: any[]) => Promise<{ error: Error | null; count: number | null }> } } | null;
}

/**
 * Execute system health check.
 *
 * @param _testOverride - Optional test-only override for the Supabase state.
 *   Pass `{ enabled, client }` to inject a mock DB client in unit tests.
 *   Never pass this in production code.
 */
export async function getHealthStatus(_testOverride?: HealthCheckOverride): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const { enabled, client } = _testOverride ?? getSupabaseState();

  const hasUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

  // CRITICAL CONFIGURATION GUARD: In production, Supabase is mandatory.
  // If Supabase is disabled or the admin client is not instantiated,
  // the server is misconfigured and must return unhealthy (HTTP 503).
  if (process.env.NODE_ENV === "production" && (!enabled || !client)) {
    console.error(`[SUPABASE_HEALTH] Configuration check failed: SUPABASE_URL=${hasUrl ? "configured" : "MISSING"}, SUPABASE_SERVICE_ROLE_KEY=${hasServiceKey ? "configured" : "MISSING"}, SUPABASE_ANON_KEY=${hasAnonKey ? "configured" : "MISSING"}, supabaseAdmin=${client ? "initialized" : "null"}`);
    return {
      status: "unhealthy",
      timestamp,
      database: "disconnected",
      environment: "production",
      uptimeSeconds,
    };
  }

  if (enabled && client) {
    try {
      const { error } = await client.from("leads").select("id", { count: "exact", head: true });
      if (!error) {
        return {
          status: "healthy",
          timestamp,
          database: "connected",
          environment: process.env.NODE_ENV || "development",
          uptimeSeconds,
        };
      }
      console.error(`[SUPABASE_HEALTH] Database query failed: code=${error.code}, message=${error.message}`);
    } catch (err: any) {
      console.error(`[SUPABASE_HEALTH] Database connection thrown exception: ${err?.message || String(err)}`);
    }

    return {
      status: "degraded",
      timestamp,
      database: "disconnected",
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds,
    };
  }

  // Local Mock Mode (only valid in development or test environment)
  return {
    status: "healthy",
    timestamp,
    database: "mock_mode",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds,
  };
}

/**
 * Gather production operational metrics
 */
export async function getSystemMetrics(_testOverride?: HealthCheckOverride): Promise<MetricsResult> {
  const timestamp = new Date().toISOString();

  let totalLeads = 0;
  let totalCalls = 0;
  let totalWebhookFailures = 0;
  let totalErrors = 0;
  let totalRateLimitEvents = 0;
  let totalBreaches = 0;

  const { enabled, client } = _testOverride ?? getSupabaseState();
  const isProd = process.env.NODE_ENV === "production";

  if (enabled && client) {
    try {
      const [leadsRes, callsRes, whRes, errRes, rlRes, breachRes] = await Promise.all([
        client.from("leads").select("id", { count: "exact", head: true }),
        client.from("leads").select("id", { count: "exact", head: true }).eq("call_opted_in", true),
        client.from("webhook_events").select("id", { count: "exact", head: true }).eq("status", "failed"),
        client.from("error_logs").select("id", { count: "exact", head: true }),
        client.from("rate_limit_log").select("id", { count: "exact", head: true }),
        client.from("rate_limit_log").select("id", { count: "exact", head: true }).like("action", "%_breach%"),
      ]);

      totalLeads = leadsRes.count || 0;
      totalCalls = callsRes.count || 0;
      totalWebhookFailures = whRes.count || 0;
      totalErrors = errRes.count || 0;
      totalRateLimitEvents = rlRes.count || 0;
      totalBreaches = breachRes.count || 0;
    } catch (err) {
      console.error("Error collecting database metrics:", err);
    }
  } else if (!isProd) {
    // Local DB metrics (strictly disallowed in production mode)
    const leads = await db.getLeads();
    totalLeads = leads.length;
    totalCalls = leads.filter((l) => l.call_opted_in).length;

    const whStore = (globalThis as any).__webhookStore as Array<any> | undefined;
    totalWebhookFailures = whStore ? whStore.filter((w) => w.status === "failed").length : 0;

    const errStore = (globalThis as any).__errorLogStore as Array<any> | undefined;
    totalErrors = errStore ? errStore.length : 0;

    const rlStore = (globalThis as any).__rateLimitStore as Array<any> | undefined;
    totalRateLimitEvents = rlStore ? rlStore.length : 0;
    totalBreaches = rlStore ? rlStore.filter((r) => r.action && r.action.includes("breach")).length : 0;
  }

  return {
    totalLeads,
    totalCalls,
    totalWebhookFailures,
    totalErrors,
    totalRateLimitEvents,
    totalBreaches,
    timestamp,
  };
}
