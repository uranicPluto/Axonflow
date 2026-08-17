import { getSupabaseAdmin } from "./supabase";

export interface WorkflowLogParams {
  workflow_name: string;
  lead_id?: string;
  step_name: string;
  status: "success" | "failed" | "info";
  error_message?: string;
}

export async function logWorkflowStep(params: WorkflowLogParams): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return;

    await admin.from("workflow_logs").insert([
      {
        workflow_name: params.workflow_name,
        node_name: params.step_name,
        error_message: params.error_message || null,
        lead_uid: params.lead_id || null,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[WORKFLOW LOGGER ERROR]", err);
  }
}
