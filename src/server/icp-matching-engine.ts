/**
 * Autonomous Pipeline Generation System — PART 2: ICP Matching Engine
 * Scores prospect companies (0-100) based on Ideal Customer Profile parameters:
 * industry fit, team size, annual revenue, location, tech stack, and growth stage.
 */

export interface ICPMatchInput {
  industry?: string;
  company_size?: number; // employee count
  revenue?: number; // annual revenue estimate
  location?: string;
  technology_stack?: string[];
  growth_stage?: string;
}

export interface ICPMatchReport {
  score: number; // 0-100
  fit: "Low" | "Medium" | "High";
  reasoning: string[];
}

export function calculateICPMatch(input: ICPMatchInput): ICPMatchReport {
  let score = 40; // base score
  const reasoning: string[] = [];

  // 1. Industry Fit (Target: Tech, SaaS, Professional Services, Healthcare, Finance, E-commerce)
  const ind = (input.industry || "").toLowerCase();
  if (ind.includes("tech") || ind.includes("software") || ind.includes("saas") || ind.includes("services") || ind.includes("agency")) {
    score += 25;
    reasoning.push("Ideal target industry match (Technology / SaaS / Professional Services) (+25)");
  } else if (ind.includes("health") || ind.includes("finance") || ind.includes("commerce")) {
    score += 15;
    reasoning.push("High-potential industry segment match (+15)");
  } else {
    score += 5;
  }

  // 2. Company Size (Ideal: 10 - 250 employees)
  const size = input.company_size || 25;
  if (size >= 10 && size <= 250) {
    score += 20;
    reasoning.push(`Sweet-spot team size (${size} employees) (+20)`);
  } else if (size > 250 && size <= 1000) {
    score += 15;
    reasoning.push(`Mid-market account size (${size} employees) (+15)`);
  } else {
    score += 5;
  }

  // 3. Revenue Fit (Ideal: $1M - $50M)
  const rev = input.revenue || 2500000;
  if (rev >= 1000000 && rev <= 50000000) {
    score += 15;
    reasoning.push(`Strong annual revenue tier ($${(rev / 1000000).toFixed(1)}M) (+15)`);
  } else if (rev > 50000000) {
    score += 10;
  }

  // 4. Growth Stage
  const stage = (input.growth_stage || "").toLowerCase();
  if (stage.includes("series") || stage.includes("growth") || stage.includes("scaling") || stage.includes("funded")) {
    score += 10;
    reasoning.push("High-growth / funded company stage (+10)");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let fit: "Low" | "Medium" | "High";
  if (finalScore >= 75) fit = "High";
  else if (finalScore >= 50) fit = "Medium";
  else fit = "Low";

  return {
    score: finalScore,
    fit,
    reasoning
  };
}
