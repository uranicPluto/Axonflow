import { createAPIFileRoute } from "@tanstack/react-start/api";
import { handleCalcomWebhook } from "../server/calcom-webhook-handler";

// Re-export so any code that previously imported from this route file still works.
export { handleCalcomWebhook };

export const APIRoute = createAPIFileRoute("/api/webhook/calcom")({
  GET: async () => {
    return new Response("Cal.com Webhook Receiver Active", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  },
  POST: async ({ request }) => {
    return handleCalcomWebhook(request);
  }
});
