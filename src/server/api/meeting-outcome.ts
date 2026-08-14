import { z } from "zod";
import { db } from "../db";
import { logError } from "../error-logger";
import { sanitizeData } from "../sanitize";

const MeetingOutcomeSchema = z.object({
  lead_id: z.string().min(1, "lead_id is required"),
  booking_id: z.string().optional(),
  meeting_notes: z.string().min(1, "Meeting notes are required"),
  budget: z.number().optional(),
  budget_confidence: z.enum(["confirmed", "estimated", "unknown"]).optional().default("estimated"),
  timeline: z.string().optional(),
  decision_makers: z.string().optional(),
  pain_points_confirmed: z.string().optional(),
  next_steps: z.string().optional(),
  stage_update: z.enum(["discovery_completed", "proposal_sent", "negotiation", "won", "lost"]).optional().default("discovery_completed")
});

export async function handleMeetingOutcomeRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const rawBody = await request.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const parseResult = MeetingOutcomeSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = parseResult.data;
    console.log(`[MEETING-OUTCOME] Processing meeting outcome for lead ${data.lead_id}...`);

    const outcome = await db.saveMeetingOutcome({
      leadId: data.lead_id,
      bookingId: data.booking_id,
      meetingNotes: data.meeting_notes,
      budget: data.budget,
      budgetConfidence: data.budget_confidence,
      timeline: data.timeline,
      decisionMakers: data.decision_makers,
      painPointsConfirmed: data.pain_points_confirmed,
      nextSteps: data.next_steps,
      stageUpdate: data.stage_update
    });

    console.log(`[MEETING-OUTCOME] Successfully processed outcome for lead ${data.lead_id}`);

    return new Response(JSON.stringify({ success: true, outcome }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[MEETING-OUTCOME] Error handling outcome submission:", err);
    await logError({
      service_name: "meeting_outcome_api",
      operation: "handle_outcome",
      error_code: "OUTCOME_ERROR",
      error_message: err?.message || "Unknown error",
      context: sanitizeData({ error: err?.stack || err })
    }).catch(() => {});

    return new Response(
      JSON.stringify({ error: "Failed to save meeting outcome" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
