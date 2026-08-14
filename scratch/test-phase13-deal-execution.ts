/**
 * Phase 13 E2E Verification Script for Autonomous Deal Execution System
 */

import { runDealExecutionAgent } from "../src/server/deal-execution-agent";
import { generateObjectionResolution } from "../src/server/objection-resolution-engine";
import { generateSalesPlaybook } from "../src/server/sales-playbook-engine";
import { predictDealRisk } from "../src/server/deal-risk-engine";
import { buildBuyingCommitteeReport } from "../src/server/buying-committee-engine";
import { buildDealTimeline } from "../src/server/deal-timeline-engine";
import { generateAutonomousActions } from "../src/server/action-center";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 13 AUTONOMOUS DEAL EXECUTION TEST ===\n");

  const testLeadId = `lead-${Date.now()}`;

  // Save test lead in DB so API endpoints find it
  await db.updateLeadMetadata(testLeadId, {
    id: testLeadId,
    name: "Sarah Connor",
    company_name: "Acme Automations",
    status: "proposal_sent",
    lead_score: 85,
    close_probability: 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // 1. Deal Execution Agent
  const plan = await runDealExecutionAgent({
    leadId: testLeadId,
    leadName: "Sarah Connor",
    companyName: "Acme Automations",
    status: "proposal_sent",
    leadScore: 85,
    healthScore: 90,
    intentScore: 88,
    closeProbability: 80
  });
  if (plan.nextActions.length > 0 && plan.confidence > 0) {
    console.log("[1/10] Deal Execution Agent ✓ (Actions: " + plan.nextActions.length + ", Confidence: " + plan.confidence + "%)");
  } else {
    throw new Error("Deal execution agent failed");
  }

  // 2. Objection Resolution Engine
  const objectionPlan = generateObjectionResolution({
    objection: "The pricing seems higher than standard CRMs",
    dealSize: 7500
  });
  if (objectionPlan.responseStrategy && objectionPlan.recommendedAssets.length > 0) {
    console.log("[2/10] Objection Resolution Engine ✓ (Strategy: " + objectionPlan.responseStrategy.substring(0, 40) + "...)");
  } else {
    throw new Error("Objection resolution engine failed");
  }

  // 3. Sales Playbook Engine
  const playbook = generateSalesPlaybook({
    dealStage: "proposal_sent",
    buyingIntentScore: 88
  });
  if (playbook.messaging.length > 0 && playbook.closingTechniques.length > 0) {
    console.log("[3/10] Sales Playbook Engine ✓ (Techniques: " + playbook.closingTechniques.length + ")");
  } else {
    throw new Error("Sales playbook engine failed");
  }

  // 4. Deal Risk Engine
  const riskReport = predictDealRisk({
    daysSinceActivity: 2,
    proposalEngagementViews: 4,
    stakeholderCount: 2,
    closeProbability: 85
  });
  if (riskReport.riskScore < 50) {
    console.log("[4/10] Deal Risk Engine ✓ (Risk Score: " + riskReport.riskScore + "/100)");
  } else {
    throw new Error("Deal risk engine failed");
  }

  // 5. Buying Committee Engine
  const committee = buildBuyingCommitteeReport([
    { lead_id: testLeadId, name: "Sarah Connor", role: "COO", influence_score: 90, champion_score: 85, decision_authority: true, sentiment: "positive" }
  ]);
  if (committee.stakeholders.length > 0 && committee.influenceMap) {
    console.log("[5/10] Buying Committee Engine ✓");
  } else {
    throw new Error("Buying committee engine failed");
  }

  // 6. Deal Timeline Engine
  const timeline = buildDealTimeline({
    leadCreatedAt: new Date().toISOString(),
    status: "proposal_sent",
    hasProposal: true
  });
  if (timeline.events.length > 0 && timeline.momentumScore > 0) {
    console.log("[6/10] Deal Timeline Engine ✓ (Events: " + timeline.events.length + ", Velocity: " + timeline.velocity + ")");
  } else {
    throw new Error("Deal timeline engine failed");
  }

  // 7. Action Center
  const actions = generateAutonomousActions([
    { id: testLeadId, name: "Sarah Connor", company_name: "Acme Automations", status: "proposal_sent", lead_score: 85 }
  ]);
  if (actions.length > 0 && actions[0].expectedRevenueImpact > 0) {
    console.log("[7/10] Action Center ✓ (Recommended: " + actions[0].action + " - Impact: $" + actions[0].expectedRevenueImpact + ")");
  } else {
    throw new Error("Action center failed");
  }

  // 8. Deal Room Data Generation
  const { handleGetDealRoomRequest } = await import("../src/server/api/deal-execution-api");
  const dealRoomRes = await handleGetDealRoomRequest(testLeadId);
  if (dealRoomRes.status === 200) {
    console.log("[8/10] Deal Room ✓");
  } else {
    throw new Error("Deal room verification failed");
  }

  // 9. APIs Verification
  const { handleRunDealExecutionRequest } = await import("../src/server/api/deal-execution-api");
  if (handleRunDealExecutionRequest && handleGetDealRoomRequest) {
    console.log("[9/10] APIs ✓");
  } else {
    throw new Error("APIs verification failed");
  }

  // 10. War Room V2 Verification
  const { handleGetRevenueWarRoomRequest } = await import("../src/server/api/revenue-copilot-api");
  const warRoomRes = await handleGetRevenueWarRoomRequest();
  if (warRoomRes.status === 200) {
    console.log("[10/10] War Room V2 ✓");
  } else {
    throw new Error("War room V2 verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 13 AUTONOMOUS DEAL EXECUTION SYSTEM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
