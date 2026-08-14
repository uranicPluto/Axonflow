/**
 * Phase 20 E2E Verification Script for Autonomous Company Operating System
 */

import { calculateCompanyHealth } from "../src/server/company-health-engine";
import { generateDecisionRecommendations } from "../src/server/decision-engine";
import { runExecutiveAgent } from "../src/server/executive-agent";
import { generateAgentCollaborations } from "../src/server/agent-collaboration-engine";
import { generateExecutivePlan } from "../src/server/executive-planning-engine";
import { getStrategicRoadmap } from "../src/server/strategic-priority-engine";
import { generateWeeklyCEOBrief } from "../src/server/ceo-briefing-engine";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 20 AUTONOMOUS COMPANY OPERATING SYSTEM TEST ===\n");

  // 1. Company Health Engine
  const healthRep = calculateCompanyHealth();
  if (healthRep.overallScore > 0 && healthRep.category === "Strong") {
    console.log("[1/11] Company Health Engine ✓ (Score: " + healthRep.overallScore + "/100, Category: " + healthRep.category + ")");
  } else {
    throw new Error("Company health engine failed");
  }

  // 2. Decision Engine
  const decisions = generateDecisionRecommendations();
  if (decisions.length > 0 && decisions[0].priority === 1) {
    console.log("[2/11] Decision Engine ✓ (Recommendations: " + decisions.length + " Items, Top Priority: " + decisions[0].title + ")");
  } else {
    throw new Error("Decision engine failed");
  }

  // 3. Executive Agent
  const execReport = await runExecutiveAgent();
  if (execReport.companyHealth && execReport.decisions.length > 0) {
    console.log("[3/11] Executive Agent ✓ (Pending Actions: " + execReport.pendingActionsCount + ", Health: " + execReport.companyHealth.overallScore + "/100)");
  } else {
    throw new Error("Executive agent failed");
  }

  // 4. Collaboration Layer
  const collabRep = generateAgentCollaborations();
  if (collabRep.jointRecommendations.length > 0 && collabRep.crossAgentSynergyScore > 80) {
    console.log("[4/11] Collaboration Layer ✓ (Joint Recommendations: " + collabRep.jointRecommendations.length + ", Synergy: " + collabRep.crossAgentSynergyScore + "/100)");
  } else {
    throw new Error("Collaboration layer failed");
  }

  // 5. Planning Engine
  const execPlan = generateExecutivePlan();
  if (execPlan.plan30Days && execPlan.plan90Days && execPlan.planAnnual) {
    console.log("[5/11] Planning Engine ✓ (30-Day Target: $" + execPlan.plan30Days.revenueTarget.toLocaleString() + ", Annual Target: $" + execPlan.planAnnual.revenueTarget.toLocaleString() + ")");
  } else {
    throw new Error("Planning engine failed");
  }

  // 6. Priority Engine
  const roadmap = getStrategicRoadmap();
  if (roadmap.objectives.length > 0 && roadmap.completionProgress > 0) {
    console.log("[6/11] Priority Engine ✓ (Progress: " + roadmap.completionProgress + "%, Top Objective: " + roadmap.topPriorityTitle + ")");
  } else {
    throw new Error("Priority engine failed");
  }

  // 7. CEO Briefing Engine
  const ceoBrief = generateWeeklyCEOBrief();
  if (ceoBrief.companyHealthScore > 0 && ceoBrief.recommendedDecisions.length > 0) {
    console.log("[7/11] CEO Briefing Engine ✓ (Brief Date: " + ceoBrief.briefDate + ", Health: " + ceoBrief.companyHealthScore + "/100)");
  } else {
    throw new Error("CEO briefing engine failed");
  }

  // 8. Action Center Data
  if (execReport.pendingActions.length > 0) {
    console.log("[8/11] Action Center ✓");
  } else {
    throw new Error("Action center verification failed");
  }

  // 9. Company OS Dashboard Data
  if (execReport.companyHealth && execReport.decisions.length > 0 && execReport.roadmap) {
    console.log("[9/11] Company OS Dashboard ✓");
  } else {
    throw new Error("Company OS dashboard verification failed");
  }

  // 10. Founder Brief V10 Data
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData) {
    console.log("[10/11] Founder Brief V10 ✓");
  } else {
    throw new Error("Founder Brief V10 verification failed");
  }

  // 11. APIs
  const { handleGetCompanyHealthRequest, handleGetExecutiveReportRequest, handleGetDecisionQueueRequest, handleGetCEOBriefRequest, handleGetCompanyRoadmapRequest } = await import("../src/server/api/company-os-api");
  const healthRes = await handleGetCompanyHealthRequest();
  const reportRes = await handleGetExecutiveReportRequest();
  const decRes = await handleGetDecisionQueueRequest();
  const briefRes = await handleGetCEOBriefRequest();
  const roadRes = await handleGetCompanyRoadmapRequest();

  if (healthRes.status === 200 && reportRes.status === 200 && decRes.status === 200 && briefRes.status === 200 && roadRes.status === 200) {
    console.log("[11/11] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 20 AUTONOMOUS COMPANY OPERATING SYSTEM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
