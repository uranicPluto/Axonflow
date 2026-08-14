import { db } from "../db";
import { runAccountExecutiveAgent } from "../account-executive-agent";
import { generateOutreachPackage } from "../autonomous-outreach-engine";
import { generateMeetingRecommendation } from "../meeting-booking-agent";
import { calculateCadencePlan } from "../sales-cadence-engine";
import { enqueueAction, getPendingQueueActions, processActionApproval } from "../execution-queue";

export async function handleRunAccountExecutiveRequest(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { leadId } = body;
    if (!leadId) return new Response(JSON.stringify({ error: "leadId is required" }), { status: 400 });

    const lead = await db.getLeadById(leadId);
    if (!lead) return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });

    const intel = await db.getLatestMeetingIntelligenceForLead(leadId);
    const eng = await db.getProposalEngagement(leadId, leadId);

    const aePlan = await runAccountExecutiveAgent({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      status: lead.status,
      leadScore: lead.lead_score,
      closeProbability: lead.close_probability,
      meetingIntelligence: intel,
      proposalEngagement: eng
    });

    const outreachType = lead.status === "proposal_sent" ? "proposal_reminder" : "follow_up";
    const outreach = generateOutreachPackage({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      leadEmail: lead.email,
      type: outreachType
    });

    const meeting = generateMeetingRecommendation({
      leadName: lead.name,
      companyName: lead.company_name,
      dealStage: lead.status,
      intentScore: lead.lead_score || 80,
      hasProposal: lead.status === "proposal_sent"
    });

    const cadence = calculateCadencePlan({
      leadId: lead.id,
      dealStage: lead.status
    });

    // Automatically enqueue action for human approval
    const queueItem = await enqueueAction(lead.id, "send_email", {
      subject: outreach.subject,
      emailBody: outreach.emailBody,
      outreachType: outreach.type,
      recipient: lead.email,
      leadName: lead.name
    });

    return new Response(
      JSON.stringify({
        success: true,
        aePlan,
        outreach,
        meeting,
        cadence,
        queueItem
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[AE-API] Error running AE agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run Account Executive agent" }), { status: 500 });
  }
}

export async function handleGetAccountExecutiveRequest(leadId: string): Promise<Response> {
  try {
    const lead = await db.getLeadById(leadId);
    if (!lead) return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });

    const intel = await db.getLatestMeetingIntelligenceForLead(leadId);
    const eng = await db.getProposalEngagement(leadId, leadId);

    const aePlan = await runAccountExecutiveAgent({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      status: lead.status,
      leadScore: lead.lead_score,
      closeProbability: lead.close_probability,
      meetingIntelligence: intel,
      proposalEngagement: eng
    });

    const outreach = generateOutreachPackage({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      leadEmail: lead.email,
      type: lead.status === "proposal_sent" ? "proposal_reminder" : "follow_up"
    });

    const meeting = generateMeetingRecommendation({
      leadName: lead.name,
      companyName: lead.company_name,
      dealStage: lead.status
    });

    const cadence = calculateCadencePlan({
      leadId: lead.id,
      dealStage: lead.status
    });

    return new Response(
      JSON.stringify({
        success: true,
        lead,
        aePlan,
        outreach,
        meeting,
        cadence
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[AE-API] Error fetching AE data:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch AE data" }), { status: 500 });
  }
}

export async function handlePostApprovalRequest(actionId: string, request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { decision, actor, payload } = body; // decision: 'approved' | 'rejected' | 'edited'

    const updated = await processActionApproval(actionId, decision || "approved", actor || "Founder", payload);

    return new Response(JSON.stringify({ success: true, updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[APPROVAL-API] Error processing approval:", err);
    return new Response(JSON.stringify({ error: "Failed to process approval" }), { status: 500 });
  }
}

export async function handleGetPendingActionsRequest(): Promise<Response> {
  try {
    const items = await getPendingQueueActions();
    return new Response(JSON.stringify({ success: true, items }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[PENDING-ACTIONS-API] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch pending actions" }), { status: 500 });
  }
}
