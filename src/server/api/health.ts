import { getHealthStatus } from "../monitoring";

/**
 * Handler for GET /api/health
 */
export async function handleHealthCheckRequest(): Promise<Response> {
  const health = await getHealthStatus();

  // DEGRADED / UNHEALTHY STATUS SEMANTICS:
  // If the health status is 'degraded' or 'unhealthy', returning HTTP 503 (Service Unavailable) is appropriate.
  const status = health.status === "healthy" ? 200 : 503;

  return new Response(JSON.stringify(health), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
