/**
 * Phase 11: Deal Probability Engine
 * Predicts the exact close probability (0-100%), confidence score (0-100%),
 * and underlying reasoning array based on meeting intelligence & lead qualification signals.
 */

export interface DealProbabilityInput {
  leadScore?: number;
  urgencyScore?: number;
  stakeholderCount?: number;
  proposalRequested?: boolean;
  budgetDiscussed?: boolean;
  timelineDiscussed?: boolean;
  buyingSignalCount?: number;
}

export interface DealProbabilityResult {
  probability: number;
  confidence: number;
  reasoning: string[];
}

export function calculateDealProbability(input: DealProbabilityInput): DealProbabilityResult {
  let score = 30; // base probability
  const reasoning: string[] = [];

  // 1. Budget Signal
  if (input.budgetDiscussed) {
    score += 18;
    reasoning.push("Budget availability explicitly discussed and aligned");
  }

  // 2. Proposal Requested
  if (input.proposalRequested) {
    score += 22;
    reasoning.push("Formal proposal blueprint requested");
  }

  // 3. Timeline Mentioned
  if (input.timelineDiscussed) {
    score += 10;
    reasoning.push("Target implementation timeline confirmed");
  }

  // 4. Multiple Stakeholders
  const stCount = input.stakeholderCount || 1;
  if (stCount > 1) {
    score += 12;
    reasoning.push(`Multiple key stakeholders (${stCount}) identified and engaged`);
  } else {
    reasoning.push("Primary decision maker engaged");
  }

  // 5. Buying Signals Count
  const signals = input.buyingSignalCount || 0;
  if (signals >= 3) {
    score += 12;
    reasoning.push(`Strong buying signals detected (${signals} high-intent signals)`);
  } else if (signals >= 1) {
    score += 6;
  }

  // 6. Urgency Boost
  const urgency = input.urgencyScore || 50;
  if (urgency >= 75) {
    score += 10;
    reasoning.push(`High urgency score (${urgency}/100)`);
  }

  // 7. Lead Score Boost
  const lScore = input.leadScore || 50;
  if (lScore >= 80) {
    score += 8;
  }

  const finalProbability = Math.min(98, Math.max(10, Math.round(score)));

  // Calculate Confidence Score
  let dataPoints = 0;
  if (input.leadScore !== undefined) dataPoints++;
  if (input.urgencyScore !== undefined) dataPoints++;
  if (input.budgetDiscussed !== undefined) dataPoints++;
  if (input.proposalRequested !== undefined) dataPoints++;
  if (input.buyingSignalCount !== undefined) dataPoints++;

  const confidence = Math.min(95, Math.max(50, 60 + dataPoints * 7));

  return {
    probability: finalProbability,
    confidence,
    reasoning
  };
}
