import { logWorkflowStep } from "./workflow-logger";

export interface N8nWebhookPayload {
  lead_id: string;
  name: string;
  email: string;
  phone?: string;
  service_interest?: string;
  problem_description?: string;
  source?: string;
  created_at?: string;
}

export async function triggerN8nExperienceServiceWebhook(payload: N8nWebhookPayload): Promise<void> {
  const webhookUrl = process.env.N8N_EXPERIENCE_SERVICE_WEBHOOK_URL || "https://house-of-workflow.app.n8n.cloud/webhook/experience-service";

  console.log("[N8N] Webhook starting", webhookUrl, payload.lead_id);
  await logWorkflowStep({
    workflow_name: "experience_service",
    lead_id: payload.lead_id,
    step_name: "n8n_webhook_trigger:starting",
    status: "info",
  });

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HouseOfWorkflow-WebIntake/1.0",
      },
      body: JSON.stringify({
        lead_id: payload.lead_id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone || "",
        service_interest: payload.service_interest || "not_sure",
        problem_description: payload.problem_description || "",
        source: payload.source || "experience_service",
        created_at: payload.created_at || new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errorTxt = await res.text().catch(() => "");
      console.error(`[N8N] Webhook failed with status ${res.status}: ${errorTxt}`);
      await logWorkflowStep({
        workflow_name: "experience_service",
        lead_id: payload.lead_id,
        step_name: "n8n_webhook_trigger",
        status: "failed",
        error_message: `HTTP ${res.status}: ${errorTxt}`,
      });
      return;
    }

    const resData = await res.text().catch(() => "OK");
    console.log("[N8N] Webhook success", resData);
    await logWorkflowStep({
      workflow_name: "experience_service",
      lead_id: payload.lead_id,
      step_name: "n8n_webhook_trigger",
      status: "success",
    });
  } catch (err: any) {
    console.error("[N8N] Webhook failed", err?.message || err);
    await logWorkflowStep({
      workflow_name: "experience_service",
      lead_id: payload.lead_id,
      step_name: "n8n_webhook_trigger",
      status: "failed",
      error_message: err?.message || String(err),
    });
  }
}
