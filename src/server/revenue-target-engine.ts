/**
 * Phase 15 — Feature 3: Revenue Target Tracking Engine
 * Calculates revenue attainment percentages, target gaps, and target surpluses
 * across monthly, quarterly, and annual growth horizons.
 */

export interface PeriodAttainment {
  period: string;
  targetRevenue: number;
  actualRevenue: number;
  attainmentPercentage: number;
  gapOrSurplus: number; // positive = surplus, negative = gap
}

export interface RevenueTargetReport {
  monthly: PeriodAttainment;
  quarterly: PeriodAttainment;
  annual: PeriodAttainment;
  overallAttainment: number;
}

export function calculateRevenueTargets(leads: any[]): RevenueTargetReport {
  const closedWonRevenue = leads
    .filter((l) => l.status === "won")
    .reduce((sum, l) => sum + (l.close_probability ? l.close_probability * 100 : 8500), 0);

  const weightedPipeline = leads
    .filter((l) => l.status !== "won" && l.status !== "lost")
    .reduce((sum, l) => sum + ((l.close_probability || 50) / 100) * 8500, 0);

  const totalCurrentRevenue = closedWonRevenue + weightedPipeline;

  const monthlyTarget = 50000;
  const quarterlyTarget = 150000;
  const annualTarget = 600000;

  const monthlyActual = Math.round(totalCurrentRevenue * 0.4);
  const quarterlyActual = Math.round(totalCurrentRevenue);
  const annualActual = Math.round(totalCurrentRevenue * 3.2);

  const monthlyAttainment = Math.min(100, Math.round((monthlyActual / monthlyTarget) * 100));
  const quarterlyAttainment = Math.min(100, Math.round((quarterlyActual / quarterlyTarget) * 100));
  const annualAttainment = Math.min(100, Math.round((annualActual / annualTarget) * 100));

  return {
    monthly: {
      period: "Monthly (Current Month)",
      targetRevenue: monthlyTarget,
      actualRevenue: monthlyActual,
      attainmentPercentage: monthlyAttainment,
      gapOrSurplus: monthlyActual - monthlyTarget
    },
    quarterly: {
      period: "Quarterly (Q4 2026)",
      targetRevenue: quarterlyTarget,
      actualRevenue: quarterlyActual,
      attainmentPercentage: quarterlyAttainment,
      gapOrSurplus: quarterlyActual - quarterlyTarget
    },
    annual: {
      period: "Annual (FY 2026)",
      targetRevenue: annualTarget,
      actualRevenue: annualActual,
      attainmentPercentage: annualAttainment,
      gapOrSurplus: annualActual - annualTarget
    },
    overallAttainment: quarterlyAttainment
  };
}
