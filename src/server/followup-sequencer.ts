/**
 * Phase 12 — Feature 9: Autonomous Follow-Up Sequencer
 * Manages 5-stage automated sales cadence:
 * - Day 1: Thank You
 * - Day 3: Proposal Reminder
 * - Day 7: Case Study
 * - Day 14: Executive Follow-Up
 * - Day 21: Breakup Email
 */

import { generateAIFollowUpEmail } from "./follow-up-engine";

export interface FollowUpSequenceData {
  id?: string;
  lead_id: string;
  sequence_stage: number; // 1-5
  last_sent_at?: string;
  next_scheduled_at?: string;
  status: "active" | "paused" | "completed";
  created_at?: string;
  updated_at?: string;
}

export const SEQUENCE_STAGES = [
  { stage: 1, name: "Day 1 Thank You", dayOffset: 1, emailType: "recap" },
  { stage: 2, name: "Day 3 Proposal Reminder", dayOffset: 3, emailType: "proposal" },
  { stage: 3, name: "Day 7 Case Study", dayOffset: 7, emailType: "recap" },
  { stage: 4, name: "Day 14 Executive Follow-Up", dayOffset: 14, emailType: "stalled_nudge" },
  { stage: 5, name: "Day 21 Breakup Email", dayOffset: 21, emailType: "stalled_nudge" }
];

export async function advanceSequenceForLead(
  leadId: string
): Promise<FollowUpSequenceData> {
  const { db } = await import("./db");
  const lead = await db.getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  const existing = await db.getFollowUpSequenceForLead(leadId);
  const currentStage = existing?.sequence_stage || 0;
  const nextStageNum = currentStage >= 5 ? 5 : currentStage + 1;
  const isCompleted = currentStage >= 5;

  const stageDef = SEQUENCE_STAGES.find((s) => s.stage === nextStageNum) || SEQUENCE_STAGES[0];
  const nextDate = new Date(Date.now() + stageDef.dayOffset * 24 * 60 * 60 * 1000).toISOString();

  // Generate Email via OpenAI / Fallback Engine
  const emailContent = await generateAIFollowUpEmail({
    leadId: lead.id,
    leadName: lead.name,
    leadEmail: lead.email,
    type: stageDef.emailType as any,
    meetingNotes: lead.problem_description || undefined
  });

  // Log in communication logs
  await db.saveCommunicationLog({
    leadId: lead.id,
    channel: "email",
    provider: "resend",
    type: stageDef.emailType,
    subject: `[Stage ${nextStageNum} - ${stageDef.name}] ${emailContent.subject}`,
    body: emailContent.html,
    recipient: lead.email,
    status: "queued"
  });

  const updatedRecord: FollowUpSequenceData = {
    lead_id: leadId,
    sequence_stage: nextStageNum,
    last_sent_at: new Date().toISOString(),
    next_scheduled_at: isCompleted ? undefined : nextDate,
    status: isCompleted ? "completed" : "active",
    updated_at: new Date().toISOString()
  };

  return db.saveFollowUpSequence(updatedRecord);
}
