/**
 * Phase 14 — Feature 5: Response Analysis Engine
 * Analyzes incoming client text messages, email replies, and meeting notes
 * to extract sentiment, intent score (0-100), urgency, buying signals, and objections.
 */

export interface ResponseAnalysisInput {
  text: string;
  leadId?: string;
}

export interface ResponseAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  intent: number;
  urgency: "Normal" | "High" | "Critical";
  buyingSignals: string[];
  objections: string[];
  recommendedAction: string;
}

export function analyzeResponseText(input: ResponseAnalysisInput): ResponseAnalysis {
  const content = (input.text || "").toLowerCase();
  const buyingSignals: string[] = [];
  const objections: string[] = [];

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  let intent = 50;
  let urgency: "Normal" | "High" | "Critical" = "Normal";

  if (content.includes("proposal") || content.includes("pricing") || content.includes("quote") || content.includes("cost")) {
    buyingSignals.push("Commercial pricing & proposal requested");
    intent += 20;
  }

  if (content.includes("asap") || content.includes("immediately") || content.includes("this week") || content.includes("urgent")) {
    buyingSignals.push("High implementation urgency expressed");
    urgency = "Critical";
    intent += 15;
  }

  if (content.includes("great") || content.includes("excited") || content.includes("sounds good") || content.includes("love")) {
    sentiment = "positive";
    intent += 15;
    buyingSignals.push("Positive prospect sentiment");
  }

  if (content.includes("expensive") || content.includes("budget constraint") || content.includes("too high")) {
    objections.push("Budget / pricing objection raised");
    intent -= 10;
  }

  if (content.includes("busy") || content.includes("delay") || content.includes("later")) {
    objections.push("Timeline / capacity delay objection");
    intent -= 10;
  }

  if (content.includes("competitor") || content.includes("other vendor")) {
    objections.push("Alternative vendor evaluation mentioned");
  }

  intent = Math.min(100, Math.max(10, intent));

  let recommendedAction = "Schedule proposal walkthrough";
  if (objections.length > 0) {
    recommendedAction = "Deploy objection resolution rebuttal & ROI proof sheet";
  } else if (intent >= 80) {
    recommendedAction = "Deliver contract signature link for immediate execution";
  }

  return {
    sentiment,
    intent,
    urgency,
    buyingSignals: buyingSignals.length > 0 ? buyingSignals : ["General inquiry"],
    objections: objections.length > 0 ? objections : ["No active objections raised"],
    recommendedAction
  };
}
