import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getHealthStatus } from "../server/monitoring";

/**
 * GET /api/health
 *
 * Returns the system health status without exposing any secrets.
 * Used by:
 *  - Vercel deployment checks
 *  - Staging boot validation
 *  - Uptime monitors
 *
 * Response does NOT include:
 *  - Environment variable values
 *  - Database connection strings
 *  - API keys or tokens
 */
export const APIRoute = createAPIFileRoute("/api/health")({
  GET: async () => {
    const health = await getHealthStatus();

    // DEGRADED STATUS SEMANTICS DECISION:
    // If the health status is 'degraded' (e.g., the Supabase database is disconnected),
    // returning HTTP 503 (Service Unavailable) is appropriate.
    // The core business function of AxonFlow (accepting webhooks, storing bookings, 
    // and updating leads) cannot operate without Supabase database connectivity.
    // Thus, load balancers and routing layers must treat degraded state as unhealthy (503)
    // so they do not route webhook traffic to a crippled instance.
    const status = health.status === "healthy" ? 200 : 503;

    return new Response(JSON.stringify(health), {
      status,
      headers: {
        "Content-Type": "application/json",
        // Enforce strict HTTP/1.1 cache prevention for health monitoring
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  },
});
