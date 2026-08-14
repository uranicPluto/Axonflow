/**
 * Phase 12 — Feature 3: Buying Intent Engine
 * Evaluates real-time client buying signals, proposal engagements, and meeting intelligence
 * to generate a 0-100 Buying Intent Score & Risk Category.
 */

export interface BuyingIntentInput {
  budgetDiscussed?: boolean;
  proposalRequested?: boolean;
  proposalViewed?: boolean;
  proposalDownloaded?: boolean;
  ceoInvolved?: boolean;
  timelineDiscussed?: boolean;
  multipleStakeholders?: boolean;
  meetingIntelligence?: any;
  proposalEngagement?: any;
}

export interface BuyingIntentReport {
  intentScore: number;
  category: "Low" | "Medium" | "High" | "Critical";
  reasons: string[];
}

export function calculateBuyingIntent(input: BuyingIntentInput): BuyingIntentReport {
  let score = 0;
  const reasons: string[] = [];

  // Budget Discussed +20
  if (input.budgetDiscussed || (input.meetingIntelligence?.budget_signals?.length || 0) > 0) {
    score += 20;
    reasons.push("Budget availability explicitly discussed (+20)");
  }

  // Proposal Requested +20
  if (input.proposalRequested || (input.meetingIntelligence?.buying_signals || []).some((s: string) => s.toLowerCase().includes("proposal"))) {
    score += 20;
    reasons.push("Proposal blueprint requested (+20)");
  }

  // Proposal Viewed +15
  if (input.proposalViewed || (input.proposalEngagement?.views || 0) > 0) {
    score += 15;
    reasons.push("Client viewed proposal blueprint (+15)");
  }

  // Proposal Downloaded +20
  if (input.proposalDownloaded || (input.proposalEngagement?.downloads || 0) > 0) {
    score += 20;
    reasons.push("Client downloaded proposal specification (+20)");
  }

  // CEO / Executive Involved +15
  if (input.ceoInvolved || (input.meetingIntelligence?.stakeholders || []).some((s: any) => {
    const role = (s.role || "").toLowerCase();
    return role.includes("ceo") || role.includes("founder") || role.includes("coo") || role.includes("vp");
  })) {
    score += 15;
    reasons.push("Executive decision maker (CEO/COO/Founder) engaged (+15)");
  }

  // Timeline Discussed +10
  if (input.timelineDiscussed || (input.meetingIntelligence?.buying_signals || []).some((s: string) => s.toLowerCase().includes("timeline") || s.toLowerCase().includes("asap"))) {
    score += 10;
    reasons.push("Target implementation timeline confirmed (+10)");
  }

  // Multiple Stakeholders +10
  if (input.multipleStakeholders || (input.meetingIntelligence?.stakeholders?.length || 0) > 1) {
    score += 10;
    reasons.push("Multiple key stakeholders engaged (+10)");
  }

  const intentScore = Math.min(100, score);
  let category: "Low" | "Medium" | "High" | "Critical";

  if (intentScore >= 80) category = "Critical";
  else if (intentScore >= 60) category = "High";
  else if (intentScore >= 40) category = "Medium";
  else category = "Low";

  return {
    intentScore,
    category,
    reasons
  };
}
