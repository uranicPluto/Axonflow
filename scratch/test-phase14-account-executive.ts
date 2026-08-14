/**
 * Phase 14 E2E Verification Script for Autonomous Account Executive
 */

import { runAccountExecutiveAgent } from "../src/server/account-executive-agent";
import { generateOutreachPackage } from "../src/server/autonomous-outreach-engine";
import { generateMeetingRecommendation } from "../src/server/meeting-booking-agent";
import { calculateCadencePlan } from "../src/server/sales-cadence-engine";
import { analyzeResponseText } from "../src/server/response-analysis-engine";
import { enqueueAction, getPendingQueueActions, processActionApproval } from "../src/server/execution-queue";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 14 AUTONOMOUS ACCOUNT EXECUTIVE TEST ===\n");

  const testLeadId = `lead-${Date.now()}`;

  await db.updateLeadMetadata(testLeadId, {
    id: testLeadId,
    name: "Sarah Connor",
    company_name: "Acme Automations",
    status: "proposal_sent",
    lead_score: 88,
    close_probability: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // 1. Account Executive Agent
  const aePlan = await runAccountExecutiveAgent({
    leadId: testLeadId,
    leadName: "Sarah Connor",
    companyName: "Acme Automations",
    status: "proposal_sent",
    leadScore: 88,
    closeProbability: 85
  });
  if (aePlan.recommendedAction && aePlan.confidence > 0) {
    console.log("[1/10] Account Executive Agent ✓ (Objective: " + aePlan.objective.substring(0, 40) + "...)");
  } else {
    throw new Error("Account executive agent failed");
  }

  // 2. Outreach Engine
  const outreach = generateOutreachPackage({
    leadId: testLeadId,
    leadName: "Sarah Connor",
    companyName: "Acme Automations",
    leadEmail: "sarah@acme.com",
    type: "proposal_reminder"
  });
  if (outreach.subject && outreach.emailBody) {
    console.log("[2/10] Outreach Engine ✓ (Subject: " + outreach.subject + ")");
  } else {
    throw new Error("Outreach engine failed");
  }

  // 3. Meeting Booking Agent
  const meeting = generateMeetingRecommendation({
    leadName: "Sarah Connor",
    companyName: "Acme Automations",
    dealStage: "proposal_sent"
  });
  if (meeting.meetingType && meeting.agenda.length > 0) {
    console.log("[3/10] Meeting Booking Agent ✓ (Type: " + meeting.meetingType + ")");
  } else {
    throw new Error("Meeting booking agent failed");
  }

  // 4. Cadence Engine
  const cadence = calculateCadencePlan({
    leadId: testLeadId,
    dealStage: "proposal_sent"
  });
  if (cadence.currentStage && cadence.sequenceProgress > 0) {
    console.log("[4/10] Cadence Engine ✓ (Stage: " + cadence.currentStage + ", Progress: " + cadence.sequenceProgress + "%)");
  } else {
    throw new Error("Cadence engine failed");
  }

  // 5. Response Analysis
  const responseAnalysis = analyzeResponseText({
    text: "The proposal looks great! We want to discuss pricing and schedule an executive alignment call ASAP."
  });
  if (responseAnalysis.sentiment === "positive" && responseAnalysis.intent >= 70) {
    console.log("[5/10] Response Analysis ✓ (Sentiment: " + responseAnalysis.sentiment + ", Intent: " + responseAnalysis.intent + ")");
  } else {
    throw new Error("Response analysis engine failed");
  }

  // 6. Execution Queue
  const queueItem = await enqueueAction(testLeadId, "send_email", {
    subject: outreach.subject,
    emailBody: outreach.emailBody,
    recipient: "sarah@acme.com"
  });
  if (queueItem && queueItem.status === "pending") {
    console.log("[6/10] Execution Queue ✓ (Queued ID: " + queueItem.id + ")");
  } else {
    throw new Error("Execution queue failed");
  }

  // 7. Approval Center Process
  const approvedItem = await processActionApproval(queueItem.id, "approved", "Founder");
  if (approvedItem && approvedItem.status === "executed") {
    console.log("[7/10] Approval Center ✓ (Action transition: " + approvedItem.status + ")");
  } else {
    throw new Error("Approval center processing failed");
  }

  // 8. APIs Verification
  const { handleRunAccountExecutiveRequest, handleGetPendingActionsRequest } = await import("../src/server/api/account-executive-api");
  const req = new Request("http://localhost/api/admin/account-executive/run", {
    method: "POST",
    body: JSON.stringify({ leadId: testLeadId })
  });
  const aeRes = await handleRunAccountExecutiveRequest(req);
  const pendingRes = await handleGetPendingActionsRequest();
  if (aeRes.status === 200 && pendingRes.status === 200) {
    console.log("[8/10] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  // 9. Sales Workspace Data
  const pendingItems = await getPendingQueueActions();
  if (Array.isArray(pendingItems)) {
    console.log("[9/10] Sales Workspace ✓");
  } else {
    throw new Error("Sales workspace verification failed");
  }

  // 10. Founder Dashboard V4 Data
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData && commandCenterData.todaysMeetingsCount !== undefined) {
    console.log("[10/10] Founder Dashboard ✓");
  } else {
    throw new Error("Founder dashboard verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 14 AUTONOMOUS ACCOUNT EXECUTIVE COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
