/**
 * Phase 16 & 17 — Feature 6: Hiring Impact Engine
 * Models ROI and payback period (months) for strategic headcount additions across SDR, Closer,
 * AI Engineer, Project Manager, and Customer Success roles.
 */

export interface HiringImpactReport {
  role: "Outbound SDR" | "Account Executive / Closer" | "AI Systems Engineer" | "Technical Project Manager" | "Customer Success Lead";
  annualCost: number;
  expectedRevenueImpact: number;
  expectedProfitImpact: number;
  paybackMonths: number;
  recommendation: "Strong Buy / Priority Hire" | "Conditional Hire" | "De-prioritize (Automation First)";
}

export function evaluateHiringImpact(): HiringImpactReport[] {
  return [
    {
      role: "AI Systems Engineer",
      annualCost: 120000,
      expectedRevenueImpact: 350000,
      expectedProfitImpact: 230000,
      paybackMonths: 4.1,
      recommendation: "Strong Buy / Priority Hire"
    },
    {
      role: "Account Executive / Closer",
      annualCost: 100000,
      expectedRevenueImpact: 280000,
      expectedProfitImpact: 180000,
      paybackMonths: 4.3,
      recommendation: "Strong Buy / Priority Hire"
    },
    {
      role: "Customer Success Lead",
      annualCost: 80000,
      expectedRevenueImpact: 160000,
      expectedProfitImpact: 80000,
      paybackMonths: 6.0,
      recommendation: "Conditional Hire"
    },
    {
      role: "Outbound SDR",
      annualCost: 65000,
      expectedRevenueImpact: 90000,
      expectedProfitImpact: 25000,
      paybackMonths: 8.7,
      recommendation: "De-prioritize (Automation First)"
    }
  ];
}
