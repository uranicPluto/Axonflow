/**
 * Phase 17 — Feature 2: Client Profitability Engine
 * Analyzes client revenue vs delivery costs to compute gross profit, margin %, and profitability scores.
 * Categorizes clients into Tiers: Tier A (>65%), Tier B (45-65%), Tier C (25-45%), Tier D (<25%).
 */

export interface ClientProfitabilityInput {
  leadId?: string;
  clientName: string;
  revenue: number;
  cost?: number;
}

export interface ClientProfitabilityReport {
  leadId?: string;
  clientName: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number; // gross margin %
  profitabilityScore: number; // 0-100
  tier: "Tier A (High Margin)" | "Tier B (Solid Margin)" | "Tier C (Low Margin)" | "Tier D (Unprofitable / At Risk)";
  recommendations: string[];
}

export function evaluateClientProfitability(input: ClientProfitabilityInput): ClientProfitabilityReport {
  const rev = input.revenue || 15000;
  const cost = input.cost || Math.round(rev * 0.25); // default 25% cost of delivery
  const grossProfit = rev - cost;
  const margin = rev > 0 ? Math.round((grossProfit / rev) * 100) : 0;

  const profitabilityScore = Math.min(100, Math.max(0, Math.round(margin * 1.1)));

  let tier: "Tier A (High Margin)" | "Tier B (Solid Margin)" | "Tier C (Low Margin)" | "Tier D (Unprofitable / At Risk)";
  if (margin >= 65) tier = "Tier A (High Margin)";
  else if (margin >= 45) tier = "Tier B (Solid Margin)";
  else if (margin >= 25) tier = "Tier C (Low Margin)";
  else tier = "Tier D (Unprofitable / At Risk)";

  const recommendations: string[] = [
    `Maintain high-margin automated delivery tier for ${input.clientName}`,
    `Upsell secondary AI workflow automation service to expand contract value`
  ];

  if (tier.includes("Tier D")) {
    recommendations.push("Renegotiate contract retainer or transition account to fully automated self-serve intake.");
  }

  return {
    leadId: input.leadId,
    clientName: input.clientName,
    revenue: rev,
    cost,
    grossProfit,
    margin,
    profitabilityScore,
    tier,
    recommendations
  };
}
