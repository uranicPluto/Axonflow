/**
 * Phase 12 — Feature 5: Stakeholder Intelligence
 * Analyzes deal stakeholders and categorizes them into Champion, Decision Maker, Blockers, and Influencers.
 */

export interface Stakeholder {
  id?: string;
  lead_id: string;
  name: string;
  role: string;
  influence_score: number; // 0-100
  champion_score: number; // 0-100
  decision_authority: boolean;
  sentiment: "positive" | "neutral" | "negative";
}

export interface StakeholderIntelligenceReport {
  champion: Stakeholder | null;
  decisionMaker: Stakeholder | null;
  blockers: Stakeholder[];
  influencers: Stakeholder[];
}

export function analyzeStakeholders(
  stakeholders: Stakeholder[]
): StakeholderIntelligenceReport {
  let champion: Stakeholder | null = null;
  let decisionMaker: Stakeholder | null = null;
  const blockers: Stakeholder[] = [];
  const influencers: Stakeholder[] = [];

  stakeholders.forEach((s) => {
    const roleLower = (s.role || "").toLowerCase();
    const isAuthority = s.decision_authority || roleLower.includes("ceo") || roleLower.includes("founder") || roleLower.includes("vp") || roleLower.includes("director");

    if (isAuthority && (!decisionMaker || s.influence_score > decisionMaker.influence_score)) {
      decisionMaker = s;
    }

    if (s.champion_score >= 70 && (!champion || s.champion_score > champion.champion_score)) {
      champion = s;
    }

    if (s.sentiment === "negative" || s.influence_score < 30) {
      blockers.push(s);
    } else if (!isAuthority && s.id !== champion?.id) {
      influencers.push(s);
    }
  });

  return {
    champion,
    decisionMaker,
    blockers,
    influencers
  };
}
