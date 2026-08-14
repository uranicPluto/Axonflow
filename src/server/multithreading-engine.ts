/**
 * Phase 14 — Feature 6: Multithreading Coverage Engine
 * Evaluates stakeholder breadth across target accounts to flag single-threaded risks,
 * missing executive sponsors, missing procurement contacts, and recommended multithreading actions.
 */

export interface CoverageInput {
  leadId: string;
  leadName: string;
  companyName: string;
  contactCount?: number;
  hasExecutiveSponsor?: boolean;
  hasProcurementContact?: boolean;
}

export interface CoverageReport {
  coverageScore: number; // 0-100
  risks: string[];
  missingStakeholders: string[];
  recommendations: string[];
}

export function evaluateMultithreadingCoverage(input: CoverageInput): CoverageReport {
  let score = 50;
  const risks: string[] = [];
  const missingStakeholders: string[] = [];
  const recommendations: string[] = [];

  const count = input.contactCount || 1;

  if (count === 1) {
    risks.push("SINGLE-THREADED DEAL RISK: Only 1 contact identified in buying committee");
    missingStakeholders.push("Executive Sponsor (CEO / COO)");
    missingStakeholders.push("Procurement / Legal Contact");
    recommendations.push(`Request introduction from ${input.leadName} to Executive Sponsor`);
    recommendations.push("Initiate outbound multithreading touchpoint to VP of Operations");
  } else if (count >= 3) {
    score += 35;
  } else {
    score += 20;
    missingStakeholders.push("Procurement Contact");
    recommendations.push("Confirm procurement & legal review timeline");
  }

  if (input.hasExecutiveSponsor) {
    score += 15;
  } else if (!missingStakeholders.includes("Executive Sponsor (CEO / COO)")) {
    missingStakeholders.push("Executive Sponsor");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    coverageScore: finalScore,
    risks,
    missingStakeholders,
    recommendations
  };
}
