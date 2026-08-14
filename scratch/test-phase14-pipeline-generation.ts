/**
 * Phase 14 E2E Verification Script for Autonomous Pipeline Generation System (Outbound AI SDR)
 */

import { discoverProspects } from "../src/server/prospect-discovery-agent";
import { runProspectResearchAgent } from "../src/server/prospect-research-agent";
import { detectIntentSignals } from "../src/server/intent-signal-engine";
import { calculateICPMatch } from "../src/server/icp-matching-engine";
import { calculateProspectScore } from "../src/server/prospect-scoring-engine";
import { runPipelineGenerationAgent } from "../src/server/pipeline-generation-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 14 PIPELINE GENERATION TEST ===\n");

  // 1. Prospect Discovery
  const prospects = await discoverProspects({ industry: "Software & AI Solutions" });
  if (prospects.length > 0 && prospects[0].company_name) {
    console.log("[1/8] Prospect Discovery ✓ (Discovered: " + prospects.length + " accounts)");
  } else {
    throw new Error("Prospect discovery failed");
  }

  // 2. Research Agent
  const research = await runProspectResearchAgent({
    companyName: prospects[0].company_name,
    industry: prospects[0].industry,
    employeeCount: prospects[0].employee_count
  });
  if (research.companySummary && research.recommendedAngle) {
    console.log("[2/8] Research Agent ✓ (Angle: " + research.recommendedAngle.substring(0, 45) + "...)");
  } else {
    throw new Error("Research agent failed");
  }

  // 3. Intent Signals
  const intentReport = detectIntentSignals({
    companyName: prospects[0].company_name,
    industry: prospects[0].industry
  });
  if (intentReport.signals.length > 0 && intentReport.score > 0) {
    console.log("[3/8] Intent Signals ✓ (Detected: " + intentReport.signals.length + " signals, Score: " + intentReport.score + ")");
  } else {
    throw new Error("Intent signal engine failed");
  }

  // 4. ICP Matching
  const icpReport = calculateICPMatch({
    industry: prospects[0].industry,
    company_size: prospects[0].employee_count,
    revenue: prospects[0].annual_revenue_estimate
  });
  if (icpReport.score > 0 && icpReport.fit) {
    console.log("[4/8] ICP Matching ✓ (Score: " + icpReport.score + "/100, Fit: " + icpReport.fit + ")");
  } else {
    throw new Error("ICP matching engine failed");
  }

  // 5. Prospect Scoring
  const prospectScore = calculateProspectScore({
    icpScore: icpReport.score,
    intentScore: intentReport.score,
    employeeCount: prospects[0].employee_count,
    hasResearch: true
  });
  if (prospectScore.score > 0 && prospectScore.category) {
    console.log("[5/8] Prospect Scoring ✓ (Score: " + prospectScore.score + "/100, Category: " + prospectScore.category + ")");
  } else {
    throw new Error("Prospect scoring engine failed");
  }

  // 6. Pipeline Generation Agent
  const report = await runPipelineGenerationAgent();
  if (report.prospectsFound > 0 && report.averageScore > 0) {
    console.log("[6/8] Pipeline Generation Agent ✓ (Found: " + report.prospectsFound + ", Avg Score: " + report.averageScore + ")");
  } else {
    throw new Error("Pipeline generation agent failed");
  }

  // 7. API Endpoints
  const { handlePostPipelineGenerateRequest, handleGetPipelineProspectsRequest } = await import("../src/server/api/pipeline-generation-api");
  const req = new Request("http://localhost/api/admin/pipeline/generate", { method: "POST" });
  const genRes = await handlePostPipelineGenerateRequest(req);
  const getRes = await handleGetPipelineProspectsRequest();
  if (genRes.status === 200 && getRes.status === 200) {
    console.log("[7/8] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  // 8. Dashboard Data
  const savedProspects = await db.getProspectAccounts();
  if (savedProspects.length > 0) {
    console.log("[8/8] Dashboard ✓");
  } else {
    throw new Error("Dashboard data verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 14 AUTONOMOUS PIPELINE GENERATION COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
