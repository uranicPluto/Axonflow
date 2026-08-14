import { z } from "zod";
import { db } from "../db";
import { generateAIFollowUpEmail } from "../follow-up-engine";
import { logError } from "../error-logger";
import { sanitizeData } from "../sanitize";

const FollowUpSchema = z.object({
  lead_id: z.string().min(1, "lead_id is required"),
  type: z.enum(["recap", "proposal", "reminder", "stalled_nudge"]).default("recap")
});

export async function handleGenerateFollowUpRequest(request: Request): Promise<Response> {
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

    const parseResult = FollowUpSchema.safeParse(body);
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
    const lead = await db.getLeadById(data.lead_id);
    if (!lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const brief = await db.getBriefForLead(lead.id);
    const proposal = await db.getProposalForLead(lead.id);

    const followUp = await generateAIFollowUpEmail({
      leadId: lead.id,
      leadName: lead.name,
      leadEmail: lead.email,
      type: data.type,
      meetingNotes: brief?.research_summary || lead.problem_description || undefined,
      proposalPackage: proposal?.recommended_package || undefined,
      proposedPrice: proposal?.estimated_price_range || undefined
    });

    // Log in communication_logs
    const commLog = await db.saveCommunicationLog({
      leadId: lead.id,
      channel: "email",
      provider: "resend",
      type: data.type,
      subject: followUp.subject,
      body: followUp.html,
      recipient: lead.email,
      status: "queued"
    });

    return new Response(JSON.stringify({ success: true, followUp, commLog }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[GENERATE-FOLLOWUP] Error generating follow-up email:", err);
    await logError({
      service_name: "followup_api",
      operation: "handle_followup",
      error_code: "FOLLOWUP_API_ERROR",
      error_message: err?.message || "Unknown error",
      context: sanitizeData({ error: err?.stack || err })
    }).catch(() => {});

    return new Response(
      JSON.stringify({ error: "Failed to generate follow-up email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
