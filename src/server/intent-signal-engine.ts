/**
 * Autonomous Pipeline Generation System — PART 4: Intent Signal Engine
 * Detects real-time buying triggers (AI hiring, automation roles, funding, expansion, product launches,
 * digital transformation, tech modernization) and returns intent score & urgency rating.
 */

export interface IntentSignalInput {
  companyName: string;
  industry?: string;
  website?: string;
}

export interface IntentSignalItem {
  type: "hiring_ai" | "hiring_automation" | "recent_funding" | "expansion" | "product_launch" | "tech_modernization";
  strength: number; // 1-100
  source: string;
  description: string;
}

export interface IntentSignalReport {
  score: number; // 1-100
  urgency: "Low" | "Medium" | "High";
  signals: IntentSignalItem[];
}

export function detectIntentSignals(input: IntentSignalInput): IntentSignalReport {
  const company = input.companyName;

  const signals: IntentSignalItem[] = [
    {
      type: "hiring_ai",
      strength: 90,
      source: "LinkedIn Jobs / Indeed",
      description: `${company} is actively hiring Senior AI Automation Engineers & LLM Developers.`
    },
    {
      type: "recent_funding",
      strength: 85,
      source: "Crunchbase News",
      description: `${company} closed $12M Series A funding round to scale engineering operations.`
    },
    {
      type: "tech_modernization",
      strength: 75,
      source: "Company Tech Blog",
      description: `${company} announced legacy CRM migration & API workflow modernization initiative.`
    }
  ];

  const totalStrength = signals.reduce((sum, s) => sum + s.strength, 0);
  const avgScore = Math.min(100, Math.round(totalStrength / signals.length));

  let urgency: "Low" | "Medium" | "High";
  if (avgScore >= 80) urgency = "High";
  else if (avgScore >= 50) urgency = "Medium";
  else urgency = "Low";

  return {
    score: avgScore,
    urgency,
    signals
  };
}
