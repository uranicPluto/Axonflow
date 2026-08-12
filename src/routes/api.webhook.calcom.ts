import { handleCalcomWebhook } from "../server/calcom-webhook-handler";

// Re-export so any code importing handleCalcomWebhook from this file still works
export { handleCalcomWebhook };

/**
 * Handler for /api/webhook/calcom (GET & POST)
 */
export async function handleCalcomWebhookRequest(request: Request): Promise<Response> {
  if (request.method === "GET") {
    return new Response("Cal.com Webhook Receiver Active", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  if (request.method === "POST") {
    return handleCalcomWebhook(request);
  }
  return new Response("Method Not Allowed", { status: 405 });
}
