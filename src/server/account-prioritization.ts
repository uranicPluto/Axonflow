/**
 * Phase 14 — Feature 2: AI Account Prioritization Engine
 * Ranks accounts into Tier 1, Tier 2, or Tier 3 based on revenue potential, intent signals,
 * industry fit, growth stage, and prior engagement history.
 */

export interface AccountPrioritizationInput {
  leadId: string;
  companyName: string;
  revenueEstimate?: number;
  intentScore?: number;
  icpScore?: number;
  hasMeetingHistory?: boolean;
}

export interface PriorityScore {
  score: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  reasoning: string[];
}

export function calculateAccountPriority(input: AccountPrioritizationInput): PriorityScore {
  let score = 50;
  const reasoning: string[] = [];

  // 1. Revenue Potential
  const rev = input.revenueEstimate || 2500000;
  if (rev >= 5000000) {
    score += 25;
    reasoning.push(`High enterprise revenue potential ($${(rev / 1000000).toFixed(1)}M) (+25)`);
  } else if (rev >= 1000000) {
    score += 15;
    reasoning.push(`Strong mid-market revenue potential ($${(rev / 1000000).toFixed(1)}M) (+15)`);
  }

  // 2. Buying Intent Signals
  const intent = input.intentScore || 70;
  if (intent >= 80) {
    score += 20;
    reasoning.push(`High buying intent signals detected (${intent}/100) (+20)`);
  } else if (intent >= 50) {
    score += 10;
  }

  // 3. ICP Match Score
  const icp = input.icpScore || 80;
  if (icp >= 80) {
    score += 15;
    reasoning.push(`Ideal Customer Profile tier match (${icp}/100) (+15)`);
  }

  // 4. Meeting History Bonus
  if (input.hasMeetingHistory) {
    score += 10;
    reasoning.push("Existing meeting history and relationship context (+10)");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let tier: "Tier 1" | "Tier 2" | "Tier 3";
  if (finalScore >= 80) tier = "Tier 1";
  else if (finalScore >= 55) tier = "Tier 2";
  else tier = "Tier 3";

  return {
    score: finalScore,
    tier,
    reasoning
  };
}
