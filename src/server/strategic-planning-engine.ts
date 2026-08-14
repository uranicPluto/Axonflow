/**
 * Phase 15 — Feature 7: Strategic Planning Engine
 * Generates 3 strategic growth scenarios (Conservative, Expected, Aggressive), forecasting monthly,
 * quarterly, and annual revenue while estimating hiring needs, pipeline requirements, and deal volume targets.
 */

export interface GrowthScenario {
  name: "Conservative" | "Expected" | "Aggressive";
  monthlyRevenue: number;
  quarterlyRevenue: number;
  annualRevenue: number;
  hiringNeeds: string[];
  pipelineRequired: number;
  dealVolumeRequired: number;
}

export interface StrategicGrowthPlan {
  currentQuarterlyTarget: number;
  scenarios: GrowthScenario[];
  recommendedScenario: "Expected";
}

export function generateStrategicGrowthPlan(currentPipelineValue: number = 125000): StrategicGrowthPlan {
  const baseQuarterly = currentPipelineValue;

  const scenarios: GrowthScenario[] = [
    {
      name: "Conservative",
      monthlyRevenue: Math.round((baseQuarterly * 0.8) / 3),
      quarterlyRevenue: Math.round(baseQuarterly * 0.8),
      annualRevenue: Math.round(baseQuarterly * 0.8 * 4),
      hiringNeeds: ["1 Part-time Operations Specialist"],
      pipelineRequired: Math.round(baseQuarterly * 0.8 * 2.5),
      dealVolumeRequired: Math.round((baseQuarterly * 0.8) / 8500)
    },
    {
      name: "Expected",
      monthlyRevenue: Math.round((baseQuarterly * 1.2) / 3),
      quarterlyRevenue: Math.round(baseQuarterly * 1.2),
      annualRevenue: Math.round(baseQuarterly * 1.2 * 4),
      hiringNeeds: ["1 Full-time AI Engineer", "1 Dedicated Account Executive"],
      pipelineRequired: Math.round(baseQuarterly * 1.2 * 3.0),
      dealVolumeRequired: Math.round((baseQuarterly * 1.2) / 8500)
    },
    {
      name: "Aggressive",
      monthlyRevenue: Math.round((baseQuarterly * 1.8) / 3),
      quarterlyRevenue: Math.round(baseQuarterly * 1.8),
      annualRevenue: Math.round(baseQuarterly * 1.8 * 4),
      hiringNeeds: ["2 Full-time AI Engineers", "2 Senior AEs", "1 RevOps Lead"],
      pipelineRequired: Math.round(baseQuarterly * 1.8 * 3.5),
      dealVolumeRequired: Math.round((baseQuarterly * 1.8) / 8500)
    }
  ];

  return {
    currentQuarterlyTarget: 150000,
    scenarios,
    recommendedScenario: "Expected"
  };
}
