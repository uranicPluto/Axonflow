/**
 * Phase 19 E2E Verification Script for Autonomous Delivery & Workforce Intelligence Platform
 */

import { evaluateProjectExecution } from "../src/server/project-execution-engine";
import { calculateTeamCapacity } from "../src/server/team-capacity-engine";
import { calculateWorkforceUtilization } from "../src/server/workforce-utilization-engine";
import { generateResourceAllocationPlan } from "../src/server/resource-allocation-engine";
import { evaluateProjectProfitability } from "../src/server/project-profitability-engine";
import { evaluateDeliveryRisk } from "../src/server/delivery-risk-engine";
import { calculateAIWorkforceMetrics } from "../src/server/ai-workforce-engine";
import { runDeliveryOperationsAgent } from "../src/server/delivery-operations-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 19 AUTONOMOUS DELIVERY & WORKFORCE PLATFORM TEST ===\n");

  // 1. Project Execution Engine
  const projRep = evaluateProjectExecution({ projectName: "Acme Corp Autonomous SDR Deployment", clientName: "Acme Corp SaaS" });
  if (projRep.completionPercent > 0 && projRep.deliveryStatus === "On Track") {
    console.log("[1/11] Project Execution Engine ✓ (Completion: " + projRep.completionPercent + "%, Status: " + projRep.deliveryStatus + ")");
  } else {
    throw new Error("Project execution engine failed");
  }

  // 2. Team Capacity Engine
  const capRep = calculateTeamCapacity();
  if (capRep.totalCapacityHours > 0 && capRep.capacityPercent > 0) {
    console.log("[2/11] Capacity Engine ✓ (Capacity: " + capRep.capacityPercent + "% Allocated, Available: " + capRep.availabilityPercent + "%)");
  } else {
    throw new Error("Capacity engine failed");
  }

  // 3. Workforce Utilization Engine
  const utilRep = calculateWorkforceUtilization();
  if (utilRep.utilizationScore > 0 && utilRep.billableUtilization > 0) {
    console.log("[3/11] Utilization Engine ✓ (Score: " + utilRep.utilizationScore + "/100, Billable: " + utilRep.billableUtilization + "%)");
  } else {
    throw new Error("Utilization engine failed");
  }

  // 4. Resource Allocation Engine
  const allocPlan = generateResourceAllocationPlan();
  if (allocPlan.allocations.length > 0 && allocPlan.balancingRecommendations.length > 0) {
    console.log("[4/11] Resource Allocation Engine ✓ (Allocations: " + allocPlan.allocations.length + " Items)");
  } else {
    throw new Error("Resource allocation engine failed");
  }

  // 5. Project Profitability Engine
  const profRep = evaluateProjectProfitability({ projectName: "Acme Corp Deployment", clientName: "Acme Corp", revenue: 45000 });
  if (profRep.grossMargin >= 80 && profRep.profitabilityTier === "Excellent") {
    console.log("[5/11] Project Profitability Engine ✓ (Margin: " + profRep.grossMargin + "%, Tier: " + profRep.profitabilityTier + ")");
  } else {
    throw new Error("Project profitability engine failed");
  }

  // 6. Delivery Risk Engine V2
  const riskRep = evaluateDeliveryRisk({ projectName: "Acme Corp Deployment" });
  if (riskRep.riskLevel === "Low" && riskRep.confidence > 80) {
    console.log("[6/11] Delivery Risk Engine V2 ✓ (Risk Level: " + riskRep.riskLevel + ", Delay Prob: " + riskRep.delayProbability + "%)");
  } else {
    throw new Error("Delivery risk engine failed");
  }

  // 7. AI Workforce Engine
  const aiWfRep = calculateAIWorkforceMetrics();
  if (aiWfRep.totalHoursSaved > 0 && aiWfRep.agents.length > 0) {
    console.log("[7/11] AI Workforce Engine ✓ (Hours Saved: +" + aiWfRep.totalHoursSaved + " hrs/mo, Lift: " + aiWfRep.productivityLift + ")");
  } else {
    throw new Error("AI workforce engine failed");
  }

  // 8. Delivery Operations Agent
  const delOpReport = await runDeliveryOperationsAgent();
  if (delOpReport.projectsOnTrackCount >= 0 && delOpReport.teamCapacity) {
    console.log("[8/11] Delivery Operations Agent ✓ (On Track: " + delOpReport.projectsOnTrackCount + ", At Risk: " + delOpReport.projectsAtRiskCount + ")");
  } else {
    throw new Error("Delivery operations agent failed");
  }

  // 9. Delivery War Room Data
  if (delOpReport.projectExecutionReports.length > 0 && delOpReport.projectProfitabilityReports.length > 0) {
    console.log("[9/11] Delivery War Room ✓");
  } else {
    throw new Error("Delivery war room data verification failed");
  }

  // 10. Founder Brief V9 Data
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData) {
    console.log("[10/11] Founder Brief V9 ✓");
  } else {
    throw new Error("Founder Brief V9 verification failed");
  }

  // 11. APIs
  const { handleGetDeliveryOperationsRequest, handleGetProjectHealthRequest, handleGetTeamCapacityRequest, handleGetResourceAllocationRequest, handleGetAIWorkforceRequest } = await import("../src/server/api/delivery-operations-api");
  const delOpRes = await handleGetDeliveryOperationsRequest();
  const projHealthRes = await handleGetProjectHealthRequest();
  const capRes = await handleGetTeamCapacityRequest();
  const allocRes = await handleGetResourceAllocationRequest();
  const aiWorkforceRes = await handleGetAIWorkforceRequest();

  if (delOpRes.status === 200 && projHealthRes.status === 200 && capRes.status === 200 && allocRes.status === 200 && aiWorkforceRes.status === 200) {
    console.log("[11/11] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 19 AUTONOMOUS DELIVERY & WORKFORCE PLATFORM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
