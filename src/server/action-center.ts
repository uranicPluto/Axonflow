/**
 * Phase 13 — Feature 8: Autonomous Action Center
 * Generates prioritized, high-leverage sales execution action recommendations with
 * expected revenue impact, confidence rating, urgency score, and strategic reasoning.
 */

export interface AutonomousActionRecommendation {
  id: string;
  action: "Send Proposal" | "Schedule Follow-up" | "Send Case Study" | "Escalate to Executive" | "Request Stakeholder Meeting" | "Trigger Pricing Discussion" | "Execute Contract";
  targetLeadId: string;
  targetLeadName: string;
  companyName?: string;
  expectedRevenueImpact: number;
  confidence: number; // 1-100
  urgency: "High" | "Critical" | "Normal";
  reasoning: string;
}

export function generateAutonomousActions(
  leads: any[]
): AutonomousActionRecommendation[] {
  const recommendations: AutonomousActionRecommendation[] = [];

  leads.forEach((l) => {
    const status = (l.status || "new").toLowerCase();
    const score = l.lead_score || 50;
    const company = l.company_name || l.name;

    if (status === "negotiation" || (score >= 85 && status === "proposal_sent")) {
      recommendations.push({
        id: `act-${l.id}-close`,
        action: "Execute Contract",
        targetLeadId: l.id,
        targetLeadName: l.name,
        companyName: company,
        expectedRevenueImpact: 10000,
        confidence: 90,
        urgency: "Critical",
        reasoning: "High buying intent and proposal approved. Execute final contract sign-off immediately."
      });
    } else if (status === "proposal_sent") {
      recommendations.push({
        id: `act-${l.id}-escalate`,
        action: "Escalate to Executive",
        targetLeadId: l.id,
        targetLeadName: l.name,
        companyName: company,
        expectedRevenueImpact: 7500,
        confidence: 82,
        urgency: "High",
        reasoning: "Proposal blueprint delivered. Schedule direct founder review call with CEO."
      });
    } else if (status === "discovery_completed") {
      recommendations.push({
        id: `act-${l.id}-proposal`,
        action: "Send Proposal",
        targetLeadId: l.id,
        targetLeadName: l.name,
        companyName: company,
        expectedRevenueImpact: 7500,
        confidence: 85,
        urgency: "High",
        reasoning: "Discovery completed with confirmed pain points. Generate and deliver proposal blueprint."
      });
    } else {
      recommendations.push({
        id: `act-${l.id}-followup`,
        action: "Schedule Follow-up",
        targetLeadId: l.id,
        targetLeadName: l.name,
        companyName: company,
        expectedRevenueImpact: 5000,
        confidence: 75,
        urgency: "Normal",
        reasoning: "New inbound opportunity. Initiate automated AI follow-up sequence."
      });
    }
  });

  return recommendations.sort((a, b) => b.confidence * b.expectedRevenueImpact - a.confidence * a.expectedRevenueImpact);
}
