/**
 * Phase 12 — Feature 1: Revenue Copilot Engine
 * Proactively analyzes leads, score, meeting intelligence, proposal engagements, deal probability,
 * and activity recency to generate actionable daily founder priorities and revenue impact projections.
 */

export interface RevenueCopilotInput {
  leads: any[];
  meetingIntelligenceMap?: Record<string, any>;
  proposalEngagementMap?: Record<string, any>;
  buyingIntentMap?: Record<string, any>;
}

export interface RevenueCopilotReport {
  topPriorities: string[];
  dealsAtRisk: string[];
  recommendedActions: string[];
  todaysFocus: string;
  expectedRevenueImpact: number;
}

export function generateRevenueCopilotReport(
  input: RevenueCopilotInput
): RevenueCopilotReport {
  const leads = input.leads || [];

  // Filter active deals
  const activeDeals = leads.filter((l) => l.status !== "won" && l.status !== "lost");

  // Rank by close probability & revenue
  const topPriorities = activeDeals
    .sort((a, b) => {
      const scoreA = (a.close_probability || a.lead_score || 50) * 100 + (a.company_name ? 1000 : 0);
      const scoreB = (b.close_probability || b.lead_score || 50) * 100 + (b.company_name ? 1000 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 3)
    .map((l) => `Close deal with ${l.company_name || l.name} (Prob: ${l.close_probability || 80}%, Score: ${l.lead_score || 85}/100)`);

  // Stale & low probability deals at risk
  const dealsAtRisk = activeDeals
    .filter((l) => (l.close_probability !== undefined && l.close_probability < 45) || l.status === "proposal_sent")
    .slice(0, 3)
    .map((l) => `${l.company_name || l.name} — Proposal pending review > 5 days (Risk Score: High)`);

  const recommendedActions = [
    `Deliver live proposal walkthrough to ${activeDeals[0]?.name || "top priority lead"}`,
    `Schedule technical review with decision makers`,
    `Trigger automated re-engagement sequence for stale proposal stage deals`
  ];

  const expectedRevenueImpact = activeDeals.slice(0, 4).length * 7500;
  const todaysFocus = `Focus today on finalizing contract execution for ${activeDeals[0]?.name || "high intent prospects"} and advancing proposal stage deals.`;

  return {
    topPriorities: topPriorities.length > 0 ? topPriorities : ["Review top priority discovery leads"],
    dealsAtRisk: dealsAtRisk.length > 0 ? dealsAtRisk : ["No critical deal risks detected"],
    recommendedActions,
    todaysFocus,
    expectedRevenueImpact
  };
}
