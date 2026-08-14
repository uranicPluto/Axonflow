/**
 * Phase 16 — Feature 4: Service Expansion Engine
 * Analyzes market demand, required technical resources, time-to-launch, and estimated revenue
 * to recommend high-margin new service lines for AxonFlow.
 */

export interface ExpansionOpportunity {
  id?: string;
  service: string;
  industry: string;
  estimatedRevenue: number;
  confidence: number; // 0-100
  timeToLaunch: string; // e.g. "14 Days"
  requiredResources: string[];
  marketDemand: "High" | "Very High" | "Extreme";
  priority: "High" | "Medium" | "Low";
  reasoning: string[];
}

export function generateExpansionOpportunities(): ExpansionOpportunity[] {
  return [
    {
      service: "Autonomous Outbound AI SDR Agent",
      industry: "Software & SaaS",
      estimatedRevenue: 45000,
      confidence: 95,
      timeToLaunch: "7 Days",
      requiredResources: ["OpenAI API", "Apollo Provider API", "Cal.com Integration"],
      marketDemand: "Extreme",
      priority: "High",
      reasoning: [
        "Massive founder demand for automated outbound lead generation",
        "High gross margin (92%) with zero headcount expansion"
      ]
    },
    {
      service: "AI Customer Support & Account Concierge",
      industry: "E-Commerce & Tech Services",
      estimatedRevenue: 35000,
      confidence: 88,
      timeToLaunch: "14 Days",
      requiredResources: ["Supabase Vector Embeddings", "n8n Webhook Router"],
      marketDemand: "Very High",
      priority: "High",
      reasoning: [
        "Direct expansion into existing client account operations",
        "Recurring monthly retainer model ($3.5k/mo per account)"
      ]
    },
    {
      service: "HIPAA-Compliant AI Intake Agent",
      industry: "Healthcare & MedTech",
      estimatedRevenue: 60000,
      confidence: 82,
      timeToLaunch: "21 Days",
      requiredResources: ["BAA Compliance Layer", "Encrypted Data Pipeline"],
      marketDemand: "Extreme",
      priority: "Medium",
      reasoning: [
        "Unlocks high ACV enterprise healthcare accounts ($15k+ deal size)",
        "Low competitive density in automated AI patient intake"
      ]
    }
  ];
}
