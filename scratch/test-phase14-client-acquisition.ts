/**
 * Phase 14 E2E Verification Script for Autonomous Client Acquisition Engine
 */

import { calculateAccountPriority } from "../src/server/account-prioritization";
import { analyzePipelineGaps } from "../src/server/pipeline-gap-analyzer";
import { identifyAccountChampion } from "../src/server/champion-engine";
import { evaluateMultithreadingCoverage } from "../src/server/multithreading-engine";
import { createReactivationOpportunity } from "../src/server/opportunity-creation-engine";
import { runPipelineAgent } from "../src/server/pipeline-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 14 CLIENT ACQUISITION TEST ===\n");

  const testLeadId = `lead-acq-${Date.now()}`;

  await db.updateLeadMetadata(testLeadId, {
    id: testLeadId,
    name: "Bruce Wayne",
    company_name: "Wayne Enterprises",
    status: "proposal_sent",
    lead_score: 92,
    close_probability: 85,
    service_interest: "Software & Defense AI",
    created_at: new Date().toISOString()
  });

  // 1. Account Prioritization
  const priority = calculateAccountPriority({
    leadId: testLeadId,
    companyName: "Wayne Enterprises",
    revenueEstimate: 10000000,
    intentScore: 90,
    icpScore: 95,
    hasMeetingHistory: true
  });
  if (priority.tier === "Tier 1" && priority.score >= 80) {
    console.log("[1/9] Account Prioritization ✓ (Tier: " + priority.tier + ", Score: " + priority.score + ")");
  } else {
    throw new Error("Account prioritization failed");
  }

  // 2. Pipeline Gap Analysis
  const leads = await db.getLeads();
  const gapReport = analyzePipelineGaps(leads);
  if (gapReport.recommendations.length > 0) {
    console.log("[2/9] Pipeline Gap Analysis ✓ (Target Gap: $" + gapReport.revenueTargetGap.toLocaleString() + ")");
  } else {
    throw new Error("Pipeline gap analysis failed");
  }

  // 3. Champion Detection
  const championReport = identifyAccountChampion({
    leadName: "Bruce Wayne",
    companyName: "Wayne Enterprises"
  });
  if (championReport.champion === "Bruce Wayne" && championReport.influenceScore > 0) {
    console.log("[3/9] Champion Detection ✓ (Champion: " + championReport.champion + ", Score: " + championReport.influenceScore + ")");
  } else {
    throw new Error("Champion detection failed");
  }

  // 4. Stakeholder Coverage
  const coverageReport = evaluateMultithreadingCoverage({
    leadId: testLeadId,
    leadName: "Bruce Wayne",
    companyName: "Wayne Enterprises",
    contactCount: 1
  });
  if (coverageReport.risks.length > 0 && coverageReport.missingStakeholders.length > 0) {
    console.log("[4/9] Stakeholder Coverage ✓ (Risks: " + coverageReport.risks.length + ")");
  } else {
    throw new Error("Multithreading coverage failed");
  }

  // 5. Opportunity Creation
  const reactivation = createReactivationOpportunity({
    id: testLeadId,
    name: "Bruce Wayne",
    company_name: "Wayne Enterprises",
    status: "proposal_sent"
  });
  if (reactivation.reactivationProbability >= 70 && reactivation.recommendedOffer) {
    console.log("[5/9] Opportunity Creation ✓ (Prob: " + reactivation.reactivationProbability + "%)");
  } else {
    throw new Error("Opportunity creation engine failed");
  }

  // 6. Pipeline Agent
  const agentReport = await runPipelineAgent();
  if (agentReport.projectedPipelineLift > 0) {
    console.log("[6/9] Pipeline Agent ✓ (Projected Lift: +$" + agentReport.projectedPipelineLift.toLocaleString() + ")");
  } else {
    throw new Error("Pipeline agent failed");
  }

  // 7. Founder Brief V4
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData) {
    console.log("[7/9] Founder Brief V4 ✓");
  } else {
    throw new Error("Founder Brief V4 verification failed");
  }

  // 8. Pipeline Control Center Data
  if (agentReport.topAccounts.length > 0 || agentReport.reactivationTargets.length > 0) {
    console.log("[8/9] Pipeline Control Center ✓");
  } else {
    throw new Error("Pipeline control center data failed");
  }

  // 9. APIs
  const { handleGetPipelineAgentRequest, handleGetAccountPrioritiesRequest, handleGetReactivationOpportunitiesRequest } = await import("../src/server/api/client-acquisition-api");
  const agentRes = await handleGetPipelineAgentRequest();
  const priorityRes = await handleGetAccountPrioritiesRequest();
  const reactRes = await handleGetReactivationOpportunitiesRequest();

  if (agentRes.status === 200 && priorityRes.status === 200 && reactRes.status === 200) {
    console.log("[9/9] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 14 AUTONOMOUS CLIENT ACQUISITION ENGINE COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
