/**
 * Phase 16 E2E Verification Script for Autonomous Growth & Market Intelligence Platform
 */

import { generateMarketIntelligenceReport } from "../src/server/market-intelligence-engine";
import { generateCompetitorReport } from "../src/server/competitor-intelligence-engine";
import { scoreIndustryAttractiveness } from "../src/server/industry-attractiveness";
import { generateExpansionOpportunities } from "../src/server/service-expansion-engine";
import { generateStrategicOpportunities } from "../src/server/strategic-opportunity-engine";
import { generateGrowthPlan } from "../src/server/growth-planning-engine";
import { detectStrategicAlerts } from "../src/server/strategic-alert-engine";
import { runGrowthAgent } from "../src/server/growth-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 16 AUTONOMOUS GROWTH & MARKET INTELLIGENCE TEST ===\n");

  const leads = await db.getLeads();

  // 1. Market Intelligence
  const marketReport = generateMarketIntelligenceReport({ industry: "Software & SaaS" });
  if (marketReport.opportunityScore > 0 && marketReport.recommendedServices.length > 0) {
    console.log("[1/10] Market Intelligence ✓ (Score: " + marketReport.opportunityScore + "/100, Services: " + marketReport.recommendedServices.length + ")");
  } else {
    throw new Error("Market intelligence engine failed");
  }

  // 2. Competitor Intelligence
  const compReport = generateCompetitorReport({ competitorName: "Legacy SDR Agency" });
  if (compReport.marketThreat > 0 && compReport.counterStrategy) {
    console.log("[2/10] Competitor Intelligence ✓ (Threat: " + compReport.marketThreat + "/100)");
  } else {
    throw new Error("Competitor intelligence engine failed");
  }

  // 3. Industry Attractiveness
  const indScore = scoreIndustryAttractiveness({ industry: "Software & SaaS" });
  if (indScore.score > 0 && indScore.rankTier === "Top Tier") {
    console.log("[3/10] Industry Attractiveness ✓ (Score: " + indScore.score + "/100, Tier: " + indScore.rankTier + ")");
  } else {
    throw new Error("Industry attractiveness engine failed");
  }

  // 4. Service Expansion
  const expansionOpps = generateExpansionOpportunities();
  if (expansionOpps.length > 0 && expansionOpps[0].estimatedRevenue > 0) {
    console.log("[4/10] Service Expansion ✓ (Expansion Services: " + expansionOpps.length + ")");
  } else {
    throw new Error("Service expansion engine failed");
  }

  // 5. Strategic Opportunities
  const stratOpps = generateStrategicOpportunities();
  if (stratOpps.length > 0 && stratOpps[0].expectedRevenueImpact > 0) {
    console.log("[5/10] Strategic Opportunities ✓ (Ranked Opportunities: " + stratOpps.length + ")");
  } else {
    throw new Error("Strategic opportunity engine failed");
  }

  // 6. Growth Planning
  const growthPlan = generateGrowthPlan();
  if (growthPlan.roadmap.length === 3 && growthPlan.totalForecastedLift > 0) {
    console.log("[6/10] Growth Planning ✓ (Lift: +$" + growthPlan.totalForecastedLift.toLocaleString() + ")");
  } else {
    throw new Error("Growth planning engine failed");
  }

  // 7. Strategic Alerts
  const alerts = detectStrategicAlerts(leads);
  if (alerts.length > 0 && alerts[0].severity) {
    console.log("[7/10] Strategic Alerts ✓ (Alerts Detected: " + alerts.length + ")");
  } else {
    throw new Error("Strategic alert engine failed");
  }

  // 8. Growth Agent
  const growthReport = await runGrowthAgent();
  if (growthReport.topIndustries.length > 0 && growthReport.estimatedRevenueImpact > 0) {
    console.log("[8/10] Growth Agent ✓ (Estimated Revenue Impact: +$" + growthReport.estimatedRevenueImpact.toLocaleString() + ")");
  } else {
    throw new Error("Growth agent failed");
  }

  // 9. Growth War Room Data
  if (growthReport.topExpansionOpportunities.length > 0 && growthReport.growthPlan) {
    console.log("[9/10] Growth War Room ✓");
  } else {
    throw new Error("Growth war room verification failed");
  }

  // 10. APIs
  const { handleGetGrowthAgentRequest, handleGetMarketIntelligenceRequest, handleGetCompetitorIntelligenceRequest, handleGetExpansionOpportunitiesRequest, handleGetStrategicAlertsRequest } = await import("../src/server/api/growth-intelligence");
  const agentRes = await handleGetGrowthAgentRequest();
  const marketRes = await handleGetMarketIntelligenceRequest();
  const compRes = await handleGetCompetitorIntelligenceRequest();
  const expRes = await handleGetExpansionOpportunitiesRequest();
  const alertRes = await handleGetStrategicAlertsRequest();

  if (agentRes.status === 200 && marketRes.status === 200 && compRes.status === 200 && expRes.status === 200 && alertRes.status === 200) {
    console.log("[10/10] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 16 AUTONOMOUS GROWTH & MARKET INTELLIGENCE PLATFORM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
