/**
 * Request Correlation ID Infrastructure
 * Generates and extracts unique x-request-id for request tracing across logs.
 */

export async function getOrCreateRequestId(): Promise<string> {
  try {
    const { getWebRequest } = await import("@tanstack/react-start/server");
    const request = getWebRequest();
    if (request) {
      const existingId = request.headers.get("x-request-id") || request.headers.get("X-Request-Id");
      if (existingId) return existingId;
    }
  } catch {
    // Non-HTTP server context or static test runner environment
  }

  // Generate a unique 12-char hex request ID
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}
