/**
 * Phase 13 — Feature 4: Deal Risk Prediction Engine
 * Analyzes inactivity, lack of stakeholder engagement, stale proposals, long sales cycles,
 * and negative sentiment to generate a comprehensive Deal Risk Report & Rescue Plan.
 */

export interface DealRiskInput {
  daysSinceActivity?: number;
  proposalEngagementViews?: number;
  stakeholderCount?: number;
  salesCycleDays?: number;
  sentiment?: "positive" | "neutral" | "negative";
  closeProbability?: number;
}

export interface RiskReport {
  riskScore: number;
  riskFactors: string[];
  churnProbability: number;
  stallProbability: number;
  rescueActions: string[];
}

export function predictDealRisk(input: DealRiskInput): RiskReport {
  let riskScore = 15; // base risk
  const riskFactors: string[] = [];
  const rescueActions: string[] = [];

  const days = input.daysSinceActivity || 0;
  if (days >= 14) {
    riskScore += 40;
    riskFactors.push(`Ghosting risk: Zero activity detected for ${days} consecutive days`);
    rescueActions.push("Trigger automated 5-stage re-engagement email sequence");
  } else if (days >= 7) {
    riskScore += 20;
    riskFactors.push(`Stall risk: No activity in last ${days} days`);
    rescueActions.push("Send executive quick-touch nudge email");
  }

  const views = input.proposalEngagementViews || 0;
  if (views === 0) {
    riskScore += 15;
    riskFactors.push("Proposal delivered but zero client views recorded");
    rescueActions.push("Deliver proposal summary via SMS / LinkedIn message");
  }

  const stCount = input.stakeholderCount || 1;
  if (stCount <= 1) {
    riskScore += 15;
    riskFactors.push("Single-threaded deal: Only one contact identified");
    rescueActions.push("Request introduction to COO / CEO decision maker");
  }

  if (input.sentiment === "negative") {
    riskScore += 25;
    riskFactors.push("Negative sentiment detected during discovery call");
    rescueActions.push("Schedule technical objection resolution session");
  }

  const finalRiskScore = Math.min(100, Math.max(0, riskScore));
  const churnProbability = Math.min(95, Math.round(finalRiskScore * 0.85));
  const stallProbability = Math.min(95, Math.round(finalRiskScore * 0.9));

  if (rescueActions.length === 0) {
    rescueActions.push("Maintain standard 3-day follow-up cadence");
  }

  return {
    riskScore: finalRiskScore,
    riskFactors: riskFactors.length > 0 ? riskFactors : ["No critical risk factors detected"],
    churnProbability,
    stallProbability,
    rescueActions
  };
}
