/**
 * Phase 14 — Feature 7: Execution Queue Manager
 * Central human-in-the-loop queue managing pending AI actions across:
 * - pending
 * - approved
 * - executed
 * - failed
 * - cancelled
 */

export interface ExecutionQueueItem {
  id?: string;
  lead_id: string;
  action_type: "send_email" | "launch_sequence" | "schedule_meeting" | "executive_escalation";
  payload: any;
  status: "pending" | "approved" | "executed" | "failed" | "cancelled";
  created_at?: string;
  approved_at?: string;
  executed_at?: string;
}

export async function enqueueAction(
  leadId: string,
  actionType: "send_email" | "launch_sequence" | "schedule_meeting" | "executive_escalation",
  payload: any
): Promise<ExecutionQueueItem> {
  const { db } = await import("./db");

  const item: ExecutionQueueItem = {
    id: `eq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    lead_id: leadId,
    action_type: actionType,
    payload,
    status: "pending",
    created_at: new Date().toISOString()
  };

  return db.saveExecutionQueueItem(item);
}

export async function getPendingQueueActions(): Promise<ExecutionQueueItem[]> {
  const { db } = await import("./db");
  return db.getPendingExecutionQueueItems();
}

export async function processActionApproval(
  queueId: string,
  decision: "approved" | "rejected" | "edited",
  actor: string = "Founder",
  updatedPayload?: any
): Promise<ExecutionQueueItem> {
  const { db } = await import("./db");
  const existing = await db.getExecutionQueueItemById(queueId);
  if (!existing) throw new Error("Queue item not found");

  let status: "pending" | "approved" | "executed" | "failed" | "cancelled" = existing.status;

  if (decision === "rejected") {
    status = "cancelled";
  } else if (decision === "approved" || decision === "edited") {
    status = "executed";
  }

  const payload = updatedPayload || existing.payload;
  const now = new Date().toISOString();

  const updated: ExecutionQueueItem = {
    ...existing,
    payload,
    status,
    approved_at: now,
    executed_at: status === "executed" ? now : undefined
  };

  await db.saveApprovalLog({
    queue_id: queueId,
    action_type: existing.action_type,
    decision,
    actor
  });

  return db.saveExecutionQueueItem(updated);
}
