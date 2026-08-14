/**
 * Phase 20 — Feature 3: Company Decision Engine
 * Collects strategic recommendations across Revenue, Growth, Finance, Customer Success, and Delivery Agents,
 * ranking opportunities by revenue impact, risk reduction, strategic value, and effort.
 */

export interface DecisionRecommendation {
  id: string;
  title: string;
  reasoning: string;
  impact: "High" | "Medium" | "Low" | "Transformational";
  confidence: number; // 0-100
  priority: number; // 1 = highest
  owner: string;
  category: "Revenue" | "Growth" | "Finance" | "Customer Success" | "Delivery";
  status: "recommended" | "approved" | "rejected" | "postponed";
  expectedRevenueImpact?: number;
}

export function generateDecisionRecommendations(): DecisionRecommendation[] {
  return [
    {
      id: "dec-001",
      title: "Launch Autonomous AI SDR Tier for High-Intent Healthcare Leads",
      reasoning: "Growth Agent identified Healthcare & MedTech as top industry ($45M TAM, 95% ICP Match). Outbound campaign automation projected to add +$45,000 ARR.",
      impact: "Transformational",
      confidence: 94,
      priority: 1,
      owner: "VP of Sales / Autonomous SDR Agent",
      category: "Growth",
      status: "recommended",
      expectedRevenueImpact: 45000
    },
    {
      id: "dec-002",
      title: "Execute Acme Corp SaaS Upsell to Enterprise Automation Module",
      reasoning: "Customer Success Agent detected 91/100 Champion health score and 92% renewal probability. Expansion opportunity estimated at +$24,000 ARR.",
      impact: "High",
      confidence: 92,
      priority: 2,
      owner: "Account Executive Agent",
      category: "Customer Success",
      status: "recommended",
      expectedRevenueImpact: 24000
    },
    {
      id: "dec-003",
      title: "Optimize Lead AI Engineer Workload Allocation via AI Workflows",
      reasoning: "Delivery Operations Agent reported 85% capacity allocation for Lead AI Engineer. Offloading routine webhook tasks to AI Agent workloads preserves 85%+ gross margin.",
      impact: "Medium",
      confidence: 90,
      priority: 3,
      owner: "Head of Delivery",
      category: "Delivery",
      status: "recommended"
    }
  ];
}
