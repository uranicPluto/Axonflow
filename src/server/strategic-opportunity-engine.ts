/**
 * Phase 16 — Feature 6: Strategic Opportunity Engine
 * Identifies and ranks strategic growth initiatives by expected revenue impact, confidence rating,
 * and implementation difficulty.
 */

export interface StrategicOpportunity {
  title: string;
  category: "Service Launch" | "Vertical Expansion" | "Partnership / Channel";
  expectedRevenueImpact: number; // in USD
  implementationDifficulty: "Low" | "Medium" | "High";
  confidence: number; // 0-100
  priority: "High" | "Medium" | "Low";
  description: string;
}

export function generateStrategicOpportunities(): StrategicOpportunity[] {
  return [
    {
      title: "Launch Autonomous AI SDR Service",
      category: "Service Launch",
      expectedRevenueImpact: 45000,
      implementationDifficulty: "Low",
      confidence: 95,
      priority: "High",
      description: "Package 24/7 outbound AI lead discovery & qualification into a high-margin recurring retainer."
    },
    {
      title: "Expand Into Healthcare & MedTech Vertical",
      category: "Vertical Expansion",
      expectedRevenueImpact: 60000,
      implementationDifficulty: "Medium",
      confidence: 85,
      priority: "High",
      description: "Target private clinics and healthcare software firms with automated patient intake workflows."
    },
    {
      title: "Launch Agency Partner Channel Program",
      category: "Partnership / Channel",
      expectedRevenueImpact: 30000,
      implementationDifficulty: "Low",
      confidence: 90,
      priority: "High",
      description: "Partner with boutique marketing agencies to white-label AxonFlow meeting briefs & CRM sync."
    },
    {
      title: "Launch AI Customer Support Agents",
      category: "Service Launch",
      expectedRevenueImpact: 35000,
      implementationDifficulty: "Medium",
      confidence: 88,
      priority: "Medium",
      description: "Expand existing client account footprint with automated vector-search concierge agents."
    }
  ];
}
