import { handleCalcomWebhook } from "../calcom-webhook-handler";

/**
 * Handler for GET/POST /api/webhook/calcom
 */
export async function handleCalcomWebhookRequest(request: Request): Promise<Response> {
  if (request.method === "GET") {
    return new Response("Cal.com Webhook Receiver Active", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return handleCalcomWebhook(request);
}
