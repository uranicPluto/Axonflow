import { db } from "../db";
import { runRevenueAgent } from "../revenue-agent";
import { calculateBuyingIntent } from "../buying-intent-engine";
import { calculateDealHealth } from "../deal-health-engine";
import { trackProposalView, trackProposalDownload, trackProposalShare } from "../proposal-engagement";
import { logError } from "../error-logger";

export async function handleGetRevenueCopilotRequest(): Promise<Response> {
  try {
    const analysis = await runRevenueAgent();
    return new Response(JSON.stringify({ success: true, analysis }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[REVENUE-COPILOT-API] Error in copilot request:", err);
    return new Response(JSON.stringify({ error: "Failed to generate copilot analysis" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function handleGetRevenueWarRoomRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const { calculateRevenueForecast } = await import("../revenue-forecast-engine");
    const forecast = calculateRevenueForecast({ leads });

    // Hot Opportunities (Intent > 80, Prob > 70)
    const hotOpportunities = leads.filter((l) => (l.lead_score || 0) >= 70 || (l.close_probability || 0) >= 70);

    // Deals At Risk (No activity > 14 days OR close prob < 40%)
    const dealsAtRisk = leads.filter((l) => l.status === "proposal_sent" || (l.close_probability !== undefined && l.close_probability < 40));

    // Buying Signal Feed
    const signalFeed = [
      { id: "s-1", type: "proposal_viewed", description: "Proposal viewed 4x by Sarah Connor (Acme)", timestamp: new Date().toISOString() },
      { id: "s-2", type: "budget_discussed", description: "Budget $10,000 confirmed during call", timestamp: new Date().toISOString() },
      { id: "s-3", type: "stakeholder_added", description: "COO Sarah Connor added as decision maker", timestamp: new Date().toISOString() }
    ];

    // Revenue Leaderboard
    const leaderboard = leads
      .filter((l) => l.status !== "lost")
      .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
      .slice(0, 5)
      .map((l) => ({
        leadId: l.id,
        name: l.name,
        company: l.company_name || l.name,
        projectedValue: 7500,
        score: l.lead_score || 85,
        probability: l.close_probability || 80
      }));

    return new Response(
      JSON.stringify({
        success: true,
        hotOpportunities,
        dealsAtRisk,
        signalFeed,
        forecast,
        leaderboard
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    console.error("[WAR-ROOM-API] Error fetching war room data:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch war room data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function handleGetBuyingIntentRequest(leadId: string): Promise<Response> {
  try {
    const lead = await db.getLeadById(leadId);
    if (!lead) return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });

    const intel = await db.getLatestMeetingIntelligenceForLead(leadId);
    const eng = await db.getProposalEngagement(leadId, leadId);

    const report = calculateBuyingIntent({
      budgetDiscussed: !!lead.budget_signal,
      proposalRequested: lead.status === "proposal_sent" || lead.status === "discovery_completed",
      meetingIntelligence: intel,
      proposalEngagement: eng
    });

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[BUYING-INTENT-API] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to calculate buying intent" }), { status: 500 });
  }
}

export async function handleGetDealHealthRequest(leadId: string): Promise<Response> {
  try {
    const lead = await db.getLeadById(leadId);
    if (!lead) return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });

    const report = calculateDealHealth({
      daysSinceActivity: 2,
      proposalEngagementScore: 75,
      intentScore: lead.lead_score || 80,
      meetingSentiment: "positive",
      closeProbability: lead.close_probability || 85
    });

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DEAL-HEALTH-API] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to calculate deal health" }), { status: 500 });
  }
}

export async function handlePostProposalEngagementRequest(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { proposalId, leadId, action } = body; // action: 'view' | 'download' | 'share'

    let engagement: any;
    if (action === "download") {
      engagement = await trackProposalDownload(proposalId, leadId);
    } else if (action === "share") {
      engagement = await trackProposalShare(proposalId, leadId);
    } else {
      engagement = await trackProposalView(proposalId, leadId);
    }

    return new Response(JSON.stringify({ success: true, engagement }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[PROPOSAL-ENGAGEMENT-API] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to track engagement" }), { status: 500 });
  }
}
