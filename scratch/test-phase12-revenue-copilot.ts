/**
 * Phase 12 E2E Verification Script for Autonomous Revenue Copilot & Revenue War Room
 */

import { calculateEngagementScore, trackProposalView } from "../src/server/proposal-engagement";
import { calculateBuyingIntent } from "../src/server/buying-intent-engine";
import { analyzeStakeholders } from "../src/server/stakeholder-intelligence";
import { calculateDealHealth } from "../src/server/deal-health-engine";
import { calculateRevenueForecast } from "../src/server/revenue-forecast-engine";
import { generateRevenueCopilotReport } from "../src/server/revenue-copilot";
import { runRevenueAgent } from "../src/server/revenue-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 12 REVENUE COPILOT TEST ===\n");

  const testProposalId = `prop-${Date.now()}`;
  const testLeadId = `lead-${Date.now()}`;

  // 1. Proposal Engagement
  const engScore = calculateEngagementScore(3, 1, 1);
  if (engScore >= 70) {
    console.log("[1/10] Proposal Engagement ✓ (Score: " + engScore + ")");
  } else {
    throw new Error("Proposal engagement calculation failed");
  }

  // 2. Buying Intent
  const intentReport = calculateBuyingIntent({
    budgetDiscussed: true,
    proposalRequested: true,
    proposalViewed: true,
    proposalDownloaded: true,
    ceoInvolved: true,
    timelineDiscussed: true,
    multipleStakeholders: true
  });
  if (intentReport.intentScore >= 80 && intentReport.category === "Critical") {
    console.log("[2/10] Buying Intent ✓ (Score: " + intentReport.intentScore + ", Cat: " + intentReport.category + ")");
  } else {
    throw new Error("Buying intent calculation failed");
  }

  // 3. Stakeholder Intelligence
  const shReport = analyzeStakeholders([
    { lead_id: testLeadId, name: "Sarah", role: "COO", influence_score: 90, champion_score: 85, decision_authority: true, sentiment: "positive" },
    { lead_id: testLeadId, name: "Michael", role: "CEO", influence_score: 95, champion_score: 60, decision_authority: true, sentiment: "positive" }
  ]);
  if (shReport.decisionMaker && shReport.champion) {
    console.log("[3/10] Stakeholder Intelligence ✓ (Decision Maker: " + shReport.decisionMaker.name + ")");
  } else {
    throw new Error("Stakeholder intelligence failed");
  }

  // 4. Deal Health
  const healthReport = calculateDealHealth({
    daysSinceActivity: 2,
    proposalEngagementScore: 75,
    intentScore: 85,
    meetingSentiment: "positive",
    closeProbability: 85
  });
  if (healthReport.score >= 80 && healthReport.status === "Healthy") {
    console.log("[4/10] Deal Health ✓ (Score: " + healthReport.score + ", Status: " + healthReport.status + ")");
  } else {
    throw new Error("Deal health engine failed");
  }

  // 5. Revenue Forecast V2
  const forecastV2 = calculateRevenueForecast({
    leads: [
      { id: testLeadId, status: "negotiation", lead_score: 90, close_probability: 85 },
      { id: "lead-2", status: "proposal_sent", lead_score: 80, close_probability: 75 },
      { id: "lead-3", status: "won", lead_score: 95, close_probability: 100 }
    ]
  });
  if (forecastV2.monthlyProjection > 0 && forecastV2.pipelineVelocity > 0) {
    console.log("[5/10] Revenue Forecast V2 ✓ (Monthly: $" + forecastV2.monthlyProjection.toLocaleString() + ", Velocity: $" + forecastV2.pipelineVelocity + "/day)");
  } else {
    throw new Error("Revenue forecast V2 failed");
  }

  // 6. Revenue Copilot
  const copilotReport = generateRevenueCopilotReport({
    leads: [
      { id: testLeadId, name: "Sarah", company_name: "Acme Automations", status: "negotiation", lead_score: 95, close_probability: 90 }
    ]
  });
  if (copilotReport.topPriorities.length > 0 && copilotReport.expectedRevenueImpact > 0) {
    console.log("[6/10] Revenue Copilot ✓ (Impact: $" + copilotReport.expectedRevenueImpact.toLocaleString() + ")");
  } else {
    throw new Error("Revenue copilot engine failed");
  }

  // 7. Revenue Agent
  const agentReport = await runRevenueAgent();
  if (agentReport.founderBriefText && agentReport.revenueSummary) {
    console.log("[7/10] Revenue Agent ✓");
  } else {
    throw new Error("Revenue agent orchestrator failed");
  }

  // 8. Revenue War Room Data
  const warRoomData = agentReport.warRoomData;
  if (warRoomData && warRoomData.forecast) {
    console.log("[8/10] Revenue War Room ✓");
  } else {
    throw new Error("Revenue war room data generation failed");
  }

  // 9. Founder Brief V3
  if (agentReport.founderBriefText.includes("Pipeline Summary") && agentReport.founderBriefText.includes("Likely Revenue Forecast")) {
    console.log("[9/10] Founder Brief V3 ✓");
  } else {
    throw new Error("Founder Brief V3 failed");
  }

  // 10. API Endpoints
  const { handleGetRevenueCopilotRequest, handleGetRevenueWarRoomRequest } = await import("../src/server/api/revenue-copilot-api");
  const copilotRes = await handleGetRevenueCopilotRequest();
  const warRoomRes = await handleGetRevenueWarRoomRequest();
  if (copilotRes.status === 200 && warRoomRes.status === 200) {
    console.log("[10/10] API Endpoints ✓");
  } else {
    throw new Error("API endpoints verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 12 AUTONOMOUS REVENUE COPILOT COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
