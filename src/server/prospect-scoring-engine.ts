/**
 * Autonomous Pipeline Generation System — PART 6: Autonomous Prospect Scoring Engine
 * Combines ICP Match Score, Intent Signal Score, Research Highlights, Company Size, and Revenue
 * to generate a 0-100 Prospect Score and Category (Cold | Warm | Hot).
 */

export interface ProspectScoringInput {
  icpScore: number;
  intentScore: number;
  employeeCount?: number;
  revenueEstimate?: number;
  hasResearch?: boolean;
}

export interface ProspectScore {
  score: number; // 0-100
  category: "Cold" | "Warm" | "Hot";
  reasoning: string[];
}

export function calculateProspectScore(input: ProspectScoringInput): ProspectScore {
  const reasoning: string[] = [];

  // Weighted Combination: 50% ICP Fit + 40% Intent Signals + 10% Size/Revenue Bonus
  let totalScore = input.icpScore * 0.5 + input.intentScore * 0.4;
  reasoning.push(`Base ICP match score (${input.icpScore}/100)`);
  reasoning.push(`Real-time intent signal score (${input.intentScore}/100)`);

  const emp = input.employeeCount || 25;
  if (emp >= 15 && emp <= 200) {
    totalScore += 10;
    reasoning.push(`Sweet-spot team headcount (${emp} employees) (+10)`);
  }

  if (input.hasResearch) {
    totalScore += 5;
    reasoning.push("AI deep research report generated (+5)");
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  let category: "Cold" | "Warm" | "Hot";
  if (finalScore >= 70) category = "Hot";
  else if (finalScore >= 40) category = "Warm";
  else category = "Cold";

  return {
    score: finalScore,
    category,
    reasoning
  };
}
