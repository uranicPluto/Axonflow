import { db } from "../db";
import { runDealExecutionAgent } from "../deal-execution-agent";
import { generateObjectionResolution } from "../objection-resolution-engine";
import { generateSalesPlaybook } from "../sales-playbook-engine";
import { predictDealRisk } from "../deal-risk-engine";
import { buildBuyingCommitteeReport } from "../buying-committee-engine";
import { buildDealTimeline } from "../deal-timeline-engine";
import { calculateBuyingIntent } from "../buying-intent-engine";
import { calculateDealHealth } from "../deal-health-engine";

export async function handleRunDealExecutionRequest(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { leadId } = body;
    if (!leadId) return new Response(JSON.stringify({ error: "leadId is required" }), { status: 400 });

    const lead = await db.getLeadById(leadId);
    if (!lead) return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });

    const intel = await db.getLatestMeetingIntelligenceForLead(leadId);
    const eng = await db.getProposalEngagement(leadId, leadId);

    const intent = calculateBuyingIntent({
      budgetDiscussed: !!lead.budget_signal,
      proposalRequested: lead.status === "proposal_sent",
      meetingIntelligence: intel,
      proposalEngagement: eng
    });

    const health = calculateDealHealth({
      daysSinceActivity: 2,
      proposalEngagementScore: eng?.engagement_score || 70,
      intentScore: intent.intentScore,
      closeProbability: lead.close_probability || 80
    });

    const plan = await runDealExecutionAgent({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      status: lead.status,
      leadScore: lead.lead_score,
      healthScore: health.score,
      intentScore: intent.intentScore,
      closeProbability: lead.close_probability,
      meetingIntelligence: intel
    });

    await db.saveDealExecutionPlan({
      lead_id: lead.id,
      current_status: plan.currentStatus,
      execution_priority: plan.executionPriority,
      blockers: plan.blockers,
      opportunities: plan.opportunities,
      next_actions: plan.nextActions,
      estimated_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: plan.confidence
    });

    return new Response(JSON.stringify({ success: true, plan, health, intent }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DEAL-EXECUTION-API] Error running deal execution:", err);
    return new Response(JSON.stringify({ error: "Failed to run deal execution" }), { status: 500 });
  }
}

export async function handleGetDealRoomRequest(leadId: string): Promise<Response> {
  try {
    const lead = await db.getLeadById(leadId);
    if (!lead) return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });

    const intel = await db.getLatestMeetingIntelligenceForLead(leadId);
    const eng = await db.getProposalEngagement(leadId, leadId);
    const stakeholders = await db.getStakeholdersForLead(leadId);

    const intent = calculateBuyingIntent({
      budgetDiscussed: !!lead.budget_signal,
      proposalRequested: lead.status === "proposal_sent",
      meetingIntelligence: intel,
      proposalEngagement: eng
    });

    const health = calculateDealHealth({
      daysSinceActivity: 2,
      proposalEngagementScore: eng?.engagement_score || 70,
      intentScore: intent.intentScore,
      closeProbability: lead.close_probability || 80
    });

    const plan = await runDealExecutionAgent({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      status: lead.status,
      leadScore: lead.lead_score,
      healthScore: health.score,
      intentScore: intent.intentScore,
      closeProbability: lead.close_probability,
      meetingIntelligence: intel
    });

    const objectionPlan = generateObjectionResolution({
      objection: intel?.objections?.[0] || "How long does implementation take?",
      dealSize: 7500
    });

    const playbook = generateSalesPlaybook({
      dealStage: lead.status,
      buyingIntentScore: intent.intentScore
    });

    const riskReport = predictDealRisk({
      daysSinceActivity: 2,
      proposalEngagementViews: eng?.views || 1,
      stakeholderCount: stakeholders.length || 1,
      closeProbability: lead.close_probability || 80
    });

    const committee = buildBuyingCommitteeReport(
      stakeholders.length > 0
        ? stakeholders
        : [
            { lead_id: lead.id, name: lead.name, role: "Decision Maker", influence_score: 90, champion_score: 80, decision_authority: true, sentiment: "positive" }
          ]
    );

    const timeline = buildDealTimeline({
      leadCreatedAt: lead.created_at || new Date().toISOString(),
      status: lead.status,
      updatedAt: lead.updated_at,
      hasMeeting: !!intel,
      hasProposal: lead.status === "proposal_sent"
    });

    return new Response(
      JSON.stringify({
        success: true,
        lead,
        plan,
        health,
        intent,
        objectionPlan,
        playbook,
        riskReport,
        committee,
        timeline
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    console.error("[DEAL-ROOM-API] Error fetching deal room data:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch deal room data" }), { status: 500 });
  }
}
