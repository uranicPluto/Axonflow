/**
 * Phase 15 E2E Verification Script for Revenue Operations & Executive Intelligence Platform
 */

import { calculateForecastAccuracy } from "../src/server/revenue-forecast-accuracy";
import { calculateRevenueTargets } from "../src/server/revenue-target-engine";
import { generateExecutiveScorecard } from "../src/server/executive-scorecard";
import { generateBoardReport } from "../src/server/board-report-engine";
import { generateOptimizationRecommendations } from "../src/server/revenue-optimization-engine";
import { generateStrategicGrowthPlan } from "../src/server/strategic-planning-engine";
import { runRevenueOperationsAgent } from "../src/server/revenue-operations-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 15 REVENUE OPERATIONS PLATFORM TEST ===\n");

  const leads = await db.getLeads();

  // 1. Forecast Accuracy Engine
  const forecastReport = calculateForecastAccuracy();
  if (forecastReport.forecastAccuracy > 0 && forecastReport.historicalAccuracyTrend.length > 0) {
    console.log("[1/10] Forecast Accuracy Engine ✓ (Accuracy: " + forecastReport.forecastAccuracy + "%, Reliability: " + forecastReport.confidenceReliability + ")");
  } else {
    throw new Error("Forecast accuracy engine failed");
  }

  // 2. Revenue Target Engine
  const targetReport = calculateRevenueTargets(leads);
  if (targetReport.quarterly.targetRevenue > 0 && targetReport.overallAttainment >= 0) {
    console.log("[2/10] Revenue Target Engine ✓ (Quarterly Attainment: " + targetReport.quarterly.attainmentPercentage + "%)");
  } else {
    throw new Error("Revenue target engine failed");
  }

  // 3. Executive Scorecard
  const scorecard = generateExecutiveScorecard(leads);
  if (scorecard.pipelineHealth > 0 && scorecard.winRate >= 0) {
    console.log("[3/10] Executive Scorecard ✓ (Pipeline Health: " + scorecard.pipelineHealth + "/100, Win Rate: " + scorecard.winRate + "%)");
  } else {
    throw new Error("Executive scorecard engine failed");
  }

  // 4. Board Report Engine
  const boardReport = await generateBoardReport(leads);
  if (boardReport.executiveSummary && boardReport.risks.length > 0) {
    console.log("[4/10] Board Report Engine ✓ (Report Period: " + boardReport.reportPeriod + ")");
  } else {
    throw new Error("Board report engine failed");
  }

  // 5. Optimization Engine
  const optimizations = generateOptimizationRecommendations(leads);
  if (optimizations.length > 0 && optimizations[0].impactEstimate > 0) {
    console.log("[5/10] Optimization Engine ✓ (Recommendations: " + optimizations.length + ", Top Impact: +$" + optimizations[0].impactEstimate.toLocaleString() + ")");
  } else {
    throw new Error("Revenue optimization engine failed");
  }

  // 6. Strategic Planning Engine
  const growthPlan = generateStrategicGrowthPlan();
  if (growthPlan.scenarios.length === 3 && growthPlan.recommendedScenario === "Expected") {
    console.log("[6/10] Strategic Planning Engine ✓ (Scenarios: " + growthPlan.scenarios.length + ", Recommended: " + growthPlan.recommendedScenario + ")");
  } else {
    throw new Error("Strategic planning engine failed");
  }

  // 7. Revenue Operations Agent
  const revopsReport = await runRevenueOperationsAgent();
  if (revopsReport.scorecard && revopsReport.topPriorities.length > 0) {
    console.log("[7/10] Revenue Operations Agent ✓ (Top Priorities: " + revopsReport.topPriorities.length + ")");
  } else {
    throw new Error("Revenue operations agent failed");
  }

  // 8. Executive Intelligence Dashboard Data
  if (revopsReport.forecastAccuracy && revopsReport.optimizations.length > 0) {
    console.log("[8/10] Executive Intelligence Dashboard ✓");
  } else {
    throw new Error("Dashboard data verification failed");
  }

  // 9. Founder Brief V5 Data
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData) {
    console.log("[9/10] Founder Brief V5 ✓");
  } else {
    throw new Error("Founder Brief V5 data verification failed");
  }

  // 10. APIs
  const { handleGetRevenueOperationsRequest, handleGetExecutiveScorecardRequest, handleGetBoardReportRequest, handleGetRevenueTargetsRequest } = await import("../src/server/api/revenue-operations");
  const revopsRes = await handleGetRevenueOperationsRequest();
  const scorecardRes = await handleGetExecutiveScorecardRequest();
  const boardRes = await handleGetBoardReportRequest();
  const targetsRes = await handleGetRevenueTargetsRequest();

  if (revopsRes.status === 200 && scorecardRes.status === 200 && boardRes.status === 200 && targetsRes.status === 200) {
    console.log("[10/10] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 15 REVENUE OPERATIONS & EXECUTIVE INTELLIGENCE PLATFORM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
