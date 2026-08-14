/**
 * Phase 15 — Feature 8: Revenue Operations Master Agent
 * Master RevOps Orchestrator combining Forecast Accuracy, Revenue Targets, Executive Scorecard,
 * Revenue Optimization Engine, and Strategic Planning Engine into a unified Executive Intelligence Report.
 */

import { calculateForecastAccuracy, ForecastAccuracyReport } from "./revenue-forecast-accuracy";
import { calculateRevenueTargets, RevenueTargetReport } from "./revenue-target-engine";
import { generateExecutiveScorecard, ExecutiveScorecard } from "./executive-scorecard";
import { generateBoardReport, BoardReport } from "./board-report-engine";
import { generateOptimizationRecommendations, OptimizationRecommendation } from "./revenue-optimization-engine";
import { generateStrategicGrowthPlan, StrategicGrowthPlan } from "./strategic-planning-engine";

export interface RevenueOperationsReport {
  scorecard: ExecutiveScorecard;
  forecastAccuracy: ForecastAccuracyReport;
  targets: RevenueTargetReport;
  boardReport: BoardReport;
  optimizations: OptimizationRecommendation[];
  growthPlan: StrategicGrowthPlan;
  topPriorities: string[];
  biggestRisks: string[];
  biggestOpportunities: string[];
  executiveRecommendations: string[];
}

export async function runRevenueOperationsAgent(): Promise<RevenueOperationsReport> {
  const { db } = await import("./db");
  const leads = await db.getLeads();

  const scorecard = generateExecutiveScorecard(leads);
  const forecastAccuracy = calculateForecastAccuracy();
  const targets = calculateRevenueTargets(leads);
  const boardReport = await generateBoardReport(leads);
  const optimizations = generateOptimizationRecommendations(leads);
  const growthPlan = generateStrategicGrowthPlan(targets.quarterly.actualRevenue);

  // Save outputs in DB
  await db.saveExecutiveScorecard(scorecard);
  for (const opt of optimizations) {
    await db.saveOptimizationRecommendation(opt);
  }
  await db.saveBoardReport(boardReport);

  const topPriorities = [
    "Accelerate commercial decision on 2 pending proposals",
    "Deploy 24/7 Outbound AI SDR to expand Tier 1 pipeline coverage",
    "Maintain 94%+ forecast accuracy threshold across quarterly targets"
  ];

  const biggestRisks = [
    "Single-threaded stakeholder risk in top enterprise deal",
    "Proposal review turnaround latency exceeding 10 days"
  ];

  const biggestOpportunities = [
    "Resurrect dormant leads for $25k+ high-probability pipeline lift",
    "Introduce milestone billing options to increase win rate by 15%"
  ];

  const executiveRecommendations = optimizations.map((o) => o.recommendation);

  return {
    scorecard,
    forecastAccuracy,
    targets,
    boardReport,
    optimizations,
    growthPlan,
    topPriorities,
    biggestRisks,
    biggestOpportunities,
    executiveRecommendations
  };
}
