/**
 * Phase 12 — Feature 6: Deal Health Engine
 * Computes deal health score (0-100) and categorizes status into Healthy, Watch, Risk, or Critical.
 */

export interface DealHealthInput {
  daysSinceActivity?: number;
  proposalEngagementScore?: number;
  intentScore?: number;
  meetingSentiment?: "positive" | "neutral" | "negative";
  stakeholderCount?: number;
  closeProbability?: number;
}

export interface DealHealthReport {
  score: number; // 0-100
  status: "Healthy" | "Watch" | "Risk" | "Critical";
  reasons: string[];
}

export function calculateDealHealth(input: DealHealthInput): DealHealthReport {
  let score = 50; // base score
  const reasons: string[] = [];

  // 1. Recency penalty / bonus
  const days = input.daysSinceActivity || 0;
  if (days <= 3) {
    score += 15;
    reasons.push("Recent client activity within last 3 days (+15)");
  } else if (days > 14) {
    score -= 25;
    reasons.push(`Deal inactive for ${days} days (-25)`);
  } else if (days > 7) {
    score -= 10;
    reasons.push(`No activity in last 7 days (-10)`);
  }

  // 2. Proposal Engagement
  const eng = input.proposalEngagementScore || 0;
  if (eng >= 50) {
    score += 15;
    reasons.push("High proposal engagement score (+15)");
  } else if (eng > 0) {
    score += 8;
  }

  // 3. Buying Intent Score
  const intent = input.intentScore || 50;
  if (intent >= 75) {
    score += 15;
    reasons.push("High buying intent rating (+15)");
  } else if (intent < 40) {
    score -= 15;
    reasons.push("Low buying intent score (-15)");
  }

  // 4. Meeting Sentiment
  const sentiment = input.meetingSentiment || "neutral";
  if (sentiment === "positive") {
    score += 10;
    reasons.push("Positive discovery call sentiment (+10)");
  } else if (sentiment === "negative") {
    score -= 15;
    reasons.push("Negative sentiment / friction detected (-15)");
  }

  // 5. Stakeholder Coverage
  const stCount = input.stakeholderCount || 1;
  if (stCount >= 2) {
    score += 10;
    reasons.push("Multiple stakeholders covered (+10)");
  }

  // 6. Close Probability
  const prob = input.closeProbability || 50;
  if (prob >= 80) {
    score += 10;
  } else if (prob < 40) {
    score -= 10;
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let status: "Healthy" | "Watch" | "Risk" | "Critical";
  if (finalScore >= 80) status = "Healthy";
  else if (finalScore >= 60) status = "Watch";
  else if (finalScore >= 40) status = "Risk";
  else status = "Critical";

  return {
    score: finalScore,
    status,
    reasons
  };
}
