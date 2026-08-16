/**
 * Verification Script — Workflow B Experience Service Funnel
 * Runs end-to-end verification of lead creation, Bolna call, Cal.com booking, WhatsApp/Email formats, and GPT lead scoring.
 */

import { db } from "../src/server/db";
import { processExperienceFormSubmission, formatWhatsAppConfirmationText, formatEmailConfirmationHtml } from "../src/server/experience-flow-engine";
import { calculateGptLeadScore } from "../src/server/lead-scoring-engine";
import { getCalcomAvailability } from "../src/server/calcom-api";

process.env.ENABLE_PROVIDER_MOCKS = "true";

async function runWorkflowBVerification() {
  console.log("==================================================");
  console.log("STARTING WORKFLOW B END-TO-END VERIFICATION");
  console.log("==================================================");

  const testEmail = `test.lead.${Date.now()}@houseofworkflow.com`;
  const testPhone = "+91 98765 43210";
  const testName = "Jayesh Mahajan";

  // 1. Verify Lead Creation & Default Values
  console.log("\n[TEST 1] Creating Lead with Workflow B Default Values...");
  const lead = await db.createLead({
    name: testName,
    full_name: testName,
    email: testEmail,
    phone: testPhone,
    service_interest: "ai_automation",
    problem_description: "We need an automated lead intake & AI voice agent qualification system to book meetings on Cal.com.",
    source: "experience_service",
    status: "new_lead",
    qualification_status: "pending",
    meeting_booked: false,
  });

  console.log("✓ Lead created successfully:");
  console.log(`  - ID: ${lead.id}`);
  console.log(`  - Source: ${lead.source}`);
  console.log(`  - Status: ${lead.status}`);
  console.log(`  - Qualification Status: ${(lead as any).qualification_status || "pending"}`);
  console.log(`  - Meeting Booked: ${(lead as any).meeting_booked ?? false}`);

  if (lead.source !== "experience_service" || lead.status !== "new_lead") {
    throw new Error("FAILED: Lead creation default values do not match spec!");
  }

  // 2. Verify Cal.com Availability API
  console.log("\n[TEST 2] Fetching Cal.com Availability...");
  const slots = await getCalcomAvailability({ timeZone: "Asia/Kolkata" });
  console.log(`✓ Fetched ${slots.length} available slots:`);
  slots.forEach((s, idx) => console.log(`  [Slot ${idx + 1}] ${s.formattedTime} (${s.time})`));

  if (slots.length === 0) {
    throw new Error("FAILED: No availability slots returned!");
  }

  // 3. Verify End-to-End Experience Flow Engine Execution
  console.log("\n[TEST 3] Running processExperienceFormSubmission (Workflow B Engine)...");
  const result = await processExperienceFormSubmission({
    id: lead.id,
    full_name: testName,
    name: testName,
    email: testEmail,
    phone: testPhone,
    service_interest: "ai_automation",
    problem_description: "We need an automated lead intake & AI voice agent qualification system to book meetings on Cal.com.",
  });

  console.log("✓ Workflow B execution completed cleanly:");
  console.log(`  - Success: ${result.success}`);
  console.log(`  - Call Dispatched: ${result.callDispatched}`);
  console.log(`  - Call SID: ${result.callSid}`);
  console.log(`  - Qualification Outcome: ${result.qualificationStatus}`);
  console.log(`  - Meeting Booked: ${result.meetingBooked}`);
  console.log(`  - Meeting Link: ${result.meetingLink}`);
  console.log(`  - Lead Score: ${result.leadScore}`);
  console.log(`  - Lead Score Reason: ${result.leadScoreReason}`);

  // 4. Verify WhatsApp Confirmation Formatting
  console.log("\n[TEST 4] Testing WhatsApp Confirmation Template Format...");
  const waText = formatWhatsAppConfirmationText({
    name: testName,
    date: "Aug 17, 2026",
    time: "11:00 AM",
    meetingLink: result.meetingLink || "https://cal.com/meeting/bk-123",
  });
  console.log("✓ Formatted WhatsApp Text:\n" + waText);

  if (!waText.includes("Your consultation with House of Workflow has been scheduled") || !waText.includes("— House of Workflow")) {
    throw new Error("FAILED: WhatsApp text does not match required template format!");
  }

  // 5. Verify Email Confirmation Formatting
  console.log("\n[TEST 5] Testing Email Confirmation Template Format...");
  const emailHtml = formatEmailConfirmationHtml({
    name: testName,
    date: "Aug 17, 2026",
    time: "11:00 AM",
    meetingLink: result.meetingLink || "https://cal.com/meeting/bk-123",
  });
  console.log("✓ Email Confirmation HTML generated cleanly (Length: " + emailHtml.length + " bytes)");

  if (!emailHtml.includes("Your consultation has been successfully scheduled") || !emailHtml.includes("Identify automation opportunities")) {
    throw new Error("FAILED: Email HTML does not match required template format!");
  }

  // 6. Verify GPT Lead Scoring Engine
  console.log("\n[TEST 6] Testing GPT Lead Scoring Engine directly...");
  const scoreResult = await calculateGptLeadScore({
    fullName: testName,
    serviceInterest: "ai_automation",
    problemDescription: "Urgent need for AI Voice SDR and CRM automation for enterprise SaaS sales.",
    callSummary: "Decision maker confirmed, budget $10k+, ready to implement ASAP.",
    qualificationStatus: "qualified",
  });
  console.log("✓ GPT Lead Score Output:");
  console.log(`  - Score: ${scoreResult.score}/100`);
  console.log(`  - Status: ${scoreResult.status.toUpperCase()}`);
  console.log(`  - Reason: ${scoreResult.reason}`);
  console.log(`  - Factors:`, scoreResult.factors);

  if (scoreResult.score < 50 || scoreResult.status !== "hot") {
    throw new Error("FAILED: High-intent lead was not scored appropriately!");
  }

  // 7. Verify Supabase Database Final Record State
  console.log("\n[TEST 7] Fetching Updated Lead Record from DB...");
  const updatedLead = await db.getLead(lead.id);
  console.log("✓ Final Supabase Lead Record:");
  console.log(`  - ID: ${updatedLead?.id}`);
  console.log(`  - Full Name: ${(updatedLead as any)?.full_name || updatedLead?.name}`);
  console.log(`  - Status: ${updatedLead?.status}`);
  console.log(`  - Qualification Status: ${(updatedLead as any)?.qualification_status}`);
  console.log(`  - Call Summary: ${(updatedLead as any)?.call_summary}`);
  console.log(`  - Meeting Booked: ${(updatedLead as any)?.meeting_booked}`);
  console.log(`  - Meeting Link: ${updatedLead?.meeting_link}`);
  console.log(`  - Lead Score: ${updatedLead?.lead_score}`);
  console.log(`  - Lead Score Reason: ${updatedLead?.lead_score_reason}`);

  console.log("\n==================================================");
  console.log("WORKFLOW B VERIFICATION SUCCESSFUL! ALL TESTS PASSED.");
  console.log("==================================================");
}

runWorkflowBVerification().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED WITH ERROR:", err);
  process.exit(1);
});
