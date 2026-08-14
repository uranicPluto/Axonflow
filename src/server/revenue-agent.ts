/**
 * Phase 12 — Feature 11: Revenue Agent Orchestrator
 * Central orchestration engine that gathers leads, meeting intelligence, proposal engagements,
 * buying intent, deal health, and revenue forecast to generate the daily founder briefing,
 * risk alerts, and priority action matrix.
 */

import { generateRevenueCopilotReport } from "./revenue-copilot";
import { calculateRevenueForecast } from "./revenue-forecast-engine";
import { calculateBuyingIntent } from "./buying-intent-engine";
import { calculateDealHealth } from "./deal-health-engine";

export interface RevenueAgentAnalysis {
  founderBriefText: string;
  topPriorities: string[];
  riskAlerts: string[];
  recommendedActions: string[];
  revenueSummary: {
    committed: number;
    likely: number;
    bestCase: number;
    confidence: number;
  };
  warRoomData: any;
}

export async function runRevenueAgent(): Promise<RevenueAgentAnalysis> {
  const { db } = await import("./db");
  const leads = await db.getLeads();

  const forecast = calculateRevenueForecast({ leads });
  const copilotReport = generateRevenueCopilotReport({ leads });

  // Hot opportunities (Intent > 80, Prob > 70)
  const hotOpportunities = leads.filter((l) => (l.lead_score || 0) >= 70 || (l.close_probability || 0) >= 70);

  // Deals at risk (No activity > 14 days OR close prob < 40%)
  const dealsAtRisk = leads.filter((l) => l.status === "proposal_sent" || (l.close_probability !== undefined && l.close_probability < 40));

  const founderBriefTextV3 = `Good morning.

Pipeline Summary:
- Committed Revenue: $${forecast.committedRevenue.toLocaleString()}
- Likely Revenue Forecast: $${forecast.likelyRevenue.toLocaleString()}
- Best Case Revenue: $${forecast.bestCaseRevenue.toLocaleString()}
- Forecast Confidence: ${forecast.confidence}%

Top Opportunities:
${hotOpportunities.slice(0, 3).map((l) => `- ${l.name} (${l.company_name || 'Prospect'}): Close Prob ${l.close_probability || 80}%`).join('\n') || '- None currently'}

Deals At Risk:
${dealsAtRisk.slice(0, 3).map((l) => `- ${l.name} (${l.company_name || 'Prospect'}): Stale proposal review`).join('\n') || '- Zero high-risk deals'}

Recommended Actions:
${copilotReport.recommendedActions.map((a) => `- ${a}`).join('\n')}
`.trim();

  // Save in daily_revenue_briefs table
  await db.saveDailyRevenueBrief({
    briefText: founderBriefTextV3,
    pipelineValue: forecast.bestCaseRevenue,
    likelyRevenue: forecast.likelyRevenue,
    dealsAtRisk: dealsAtRisk.length
  });

  return {
    founderBriefText: founderBriefTextV3,
    topPriorities: copilotReport.topPriorities,
    riskAlerts: dealsAtRisk.map((l) => `Risk on ${l.company_name || l.name}: Proposal review delayed`),
    recommendedActions: copilotReport.recommendedActions,
    revenueSummary: {
      committed: forecast.committedRevenue,
      likely: forecast.likelyRevenue,
      bestCase: forecast.bestCaseRevenue,
      confidence: forecast.confidence
    },
    warRoomData: {
      hotOpportunities: hotOpportunities.slice(0, 5),
      dealsAtRisk: dealsAtRisk.slice(0, 5),
      forecast
    }
  };
}
