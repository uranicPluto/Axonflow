import { z } from "zod";
import { db } from "../db";
import { runMeetingIntelligenceAgent } from "../meeting-intelligence-agent";
import { calculateDealProbability } from "../deal-probability-engine";
import { calculateLeadScore } from "../lead-scoring-engine";
import { logError } from "../error-logger";
import { sanitizeData } from "../sanitize";

const PostTranscriptSchema = z.object({
  leadId: z.string().min(1, "leadId is required"),
  transcript: z.string().min(1, "transcript is required"),
  recordingUrl: z.string().optional(),
  durationMinutes: z.number().optional()
});

export async function handlePostTranscriptRequest(request: Request): Promise<Response> {
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

    const parseResult = PostTranscriptSchema.safeParse(body);
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

    const { leadId, transcript, recordingUrl, durationMinutes } = parseResult.data;
    console.log(`[TRANSCRIPTS-API] Processing discovery transcript for lead ${leadId}...`);

    const lead = await db.getLeadById(leadId);
    if (!lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Store Transcript
    const savedTranscript = await db.saveMeetingTranscript({
      leadId,
      transcript,
      recordingUrl,
      durationMinutes
    });

    // 2. Run AI Meeting Intelligence Agent
    const insightsReport = await runMeetingIntelligenceAgent(transcript, lead.name);

    // 3. Save Meeting Insights
    const savedInsights = await db.saveMeetingInsights({
      leadId,
      transcriptId: savedTranscript.id,
      insights: insightsReport
    });

    // 4. Calculate Deal Probability
    const dealProbResult = calculateDealProbability({
      leadScore: lead.lead_score || 50,
      urgencyScore: insightsReport.urgencyScore,
      stakeholderCount: insightsReport.stakeholders.length,
      proposalRequested: insightsReport.buyingSignals.some((s) => s.toLowerCase().includes("proposal")),
      budgetDiscussed: insightsReport.budgetSignals.length > 0,
      timelineDiscussed: insightsReport.buyingSignals.some((s) => s.toLowerCase().includes("timeline") || s.toLowerCase().includes("date")),
      buyingSignalCount: insightsReport.buyingSignals.length
    });

    // 5. Recalculate Lead Score
    const newScoreResult = calculateLeadScore({
      leadId,
      hasQuestionnaire: true,
      companySize: lead.team_size,
      urgency: lead.urgency,
      budgetSignal: lead.budget_signal,
      meetingCompleted: true,
      meetingOutcomeNotes: insightsReport.executiveSummary,
      budgetDiscussed: insightsReport.budgetSignals.length > 0,
      proposalRequested: insightsReport.buyingSignals.some((s) => s.toLowerCase().includes("proposal")),
      timelineMentioned: insightsReport.buyingSignals.some((s) => s.toLowerCase().includes("timeline")),
      multipleStakeholders: insightsReport.stakeholders.length > 1,
      hasStrongPainPoints: insightsReport.painPoints.length >= 2
    });

    await db.saveLeadScore(newScoreResult);

    // 6. Update Lead Metadata
    await db.updateLeadMetadata(leadId, {
      status: lead.status === "new" || lead.status === "meeting_booked" ? "discovery_completed" : lead.status,
      lead_score: newScoreResult.total_score,
      close_probability: dealProbResult.probability,
      lead_score_reason: `Meeting Intelligence generated. Close prob: ${dealProbResult.probability}%, Score: ${newScoreResult.total_score}/100.`
    });

    await db.addLeadActivity(leadId, "meeting_intelligence_generated", `Discovery transcript processed. Close Probability: ${dealProbResult.probability}%.`, "system");

    return new Response(
      JSON.stringify({
        success: true,
        insights: insightsReport,
        leadScore: newScoreResult.total_score,
        closeProbability: dealProbResult.probability,
        dealProbabilityDetails: dealProbResult
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    console.error("[TRANSCRIPTS-API] Error processing transcript:", err);
    await logError({
      service_name: "transcripts_api",
      operation: "handle_transcript",
      error_code: "TRANSCRIPT_API_ERROR",
      error_message: err?.message || "Unknown error",
      context: sanitizeData({ error: err?.stack || err })
    }).catch(() => {});

    return new Response(
      JSON.stringify({ error: "Failed to process transcript" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function handleGetMeetingIntelligenceRequest(leadId: string): Promise<Response> {
  try {
    const intelligence = await db.getLatestMeetingIntelligenceForLead(leadId);
    return new Response(JSON.stringify({ success: true, intelligence }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[TRANSCRIPTS-API] Error fetching intelligence:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch meeting intelligence" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
