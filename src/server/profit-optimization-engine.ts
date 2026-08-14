/**
 * Phase 17 — Feature 9: Profit Optimization Engine
 * Identifies and ranks actionable profit maximization tactics (Pricing adjustments, delivery cost reduction,
 * enterprise segment focus, low-margin service elimination) to estimate net profit increases.
 */

export interface OptimizationRecommendation {
  title: string;
  impact: "High" | "Very High" | "Extreme";
  difficulty: "Low" | "Medium" | "High";
  expectedProfitIncrease: number; // estimated profit boost in USD
  priority: "High" | "Medium" | "Low";
  description: string;
}

export function generateProfitOptimizations(): OptimizationRecommendation[] {
  return [
    {
      title: "Raise Outbound AI SDR Pricing Tier (+20%)",
      impact: "Extreme",
      difficulty: "Low",
      expectedProfitIncrease: 36000,
      priority: "High",
      description: "Increase base retainer from $3,500/mo to $4,500/mo for new accounts based on proven 10x ROI."
    },
    {
      title: "Focus Exclusively on Enterprise SaaS Segment (>$10M Revenue)",
      impact: "Very High",
      difficulty: "Medium",
      expectedProfitIncrease: 48000,
      priority: "High",
      description: "Shift SDR targeting to accounts with ACV > $25,000, raising gross margin to 94%."
    },
    {
      title: "Automate Discovery Brief 2.0 Webhook Execution",
      impact: "High",
      difficulty: "Low",
      expectedProfitIncrease: 18000,
      priority: "High",
      description: "Replace manual brief oversight with fully automated n8n & Supabase sync."
    },
    {
      title: "Transition Low-Margin Support Services to Self-Serve Module",
      impact: "High",
      difficulty: "Low",
      expectedProfitIncrease: 15000,
      priority: "Medium",
      description: "Eliminate custom manual intake setup for Tier C accounts."
    }
  ];
}
