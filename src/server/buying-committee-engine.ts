/**
 * Phase 13 — Feature 5: Executive Buying Committee Map Engine
 * Analyzes stakeholder dynamics, identifies key decision makers, champions, blockers,
 * flags missing executive roles, and generates targeted engagement recommendations.
 */

import { analyzeStakeholders, Stakeholder } from "./stakeholder-intelligence";

export interface BuyingCommitteeReport {
  stakeholders: Stakeholder[];
  influenceMap: Record<string, string>;
  missingContacts: string[];
  engagementRecommendations: string[];
}

export function buildBuyingCommitteeReport(
  stakeholders: Stakeholder[]
): BuyingCommitteeReport {
  const analysis = analyzeStakeholders(stakeholders);
  const influenceMap: Record<string, string> = {};
  const missingContacts: string[] = [];
  const engagementRecommendations: string[] = [];

  stakeholders.forEach((s) => {
    influenceMap[s.name] = `${s.role} (Influence: ${s.influence_score}/100, Sentiment: ${s.sentiment})`;
  });

  const rolesPresent = stakeholders.map((s) => (s.role || "").toLowerCase());
  const hasCEO = rolesPresent.some((r) => r.includes("ceo") || r.includes("founder"));
  const hasCTO = rolesPresent.some((r) => r.includes("cto") || r.includes("engineering") || r.includes("tech"));
  const hasCFO = rolesPresent.some((r) => r.includes("cfo") || r.includes("budget") || r.includes("finance"));

  if (!hasCEO) {
    missingContacts.push("CEO / Founder (Final Sign-off Authority)");
    engagementRecommendations.push("Ask champion for executive introduction to CEO for strategic alignment");
  }
  if (!hasCTO) {
    missingContacts.push("CTO / Technical Lead (Security & Integration Review)");
    engagementRecommendations.push("Deliver technical integration architecture blueprint to engineering lead");
  }
  if (!hasCFO && (analysis.decisionMaker?.influence_score || 0) < 80) {
    missingContacts.push("CFO / Finance Lead (Commercial Approval)");
  }

  if (analysis.champion) {
    engagementRecommendations.push(`Equip champion (${analysis.champion.name}) with ROI calculator sheet for internal presentation`);
  }

  return {
    stakeholders,
    influenceMap,
    missingContacts: missingContacts.length > 0 ? missingContacts : ["Full buying committee covered"],
    engagementRecommendations
  };
}
