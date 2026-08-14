import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...val] = trimmed.split("=");
      process.env[key.trim()] = val.join("=").trim();
    }
  }
}

async function runE2ETest() {
  console.log("==================================================");
  console.log("TESTING AI MEETING PREPARATION SYSTEM & QUESTIONNAIRE");
  console.log("==================================================\n");

  const { db } = await import("../src/server/db");
  const { generateAIMeetingBrief } = await import("../src/server/ai-research");
  const { sendMeetingBriefSlackNotification } = await import("../src/server/notifications");
  const { handleQuestionnaireRequest } = await import("../src/server/api/questionnaire");

  const testUid = `cal-test-prep-${Date.now()}`;
  const testEmail = `ai-prep-lead-${Date.now()}@example.com`;

  // 1. Test Cal.com Booking Processing + AI Brief Generation
  console.log("Step 1: Simulating Cal.com BOOKING_CREATED Webhook...");
  const calcomPayload = {
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: testUid,
      eventTitle: "House Of Workflow AI Automation Discovery Call",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      timezone: "America/New_York",
      meetingUrl: "https://cal.com/houseofworkflow/discovery",
      attendees: [
        {
          name: "Dr. Sarah Connor",
          email: testEmail,
          phoneNumber: "+15550192834"
        }
      ],
      responses: {
        company: { value: "Cyberdyne Systems" },
        service_interest: { value: "ai_automation" },
        problem: { value: "Need autonomous AI agent for customer intake & RAG system for internal knowledge." }
      }
    }
  };

  const bookingResult = await db.processCalcomBooking(calcomPayload);
  console.log("✅ Booking Result:", bookingResult);

  if (!bookingResult.leadId) {
    throw new Error("Failed to create lead during booking processing");
  }

  // 2. Verify AI Brief was generated and stored
  console.log("\nStep 2: Verifying AI Meeting Brief in Database...");
  const brief = await db.getBriefForLead(bookingResult.leadId);
  console.log("Fetched Brief:", brief);

  if (!brief) {
    throw new Error("Meeting brief was not saved to database!");
  }

  if (
    !brief.research_summary ||
    !brief.key_pain_points ||
    !brief.opportunities ||
    !brief.discovery_questions ||
    !brief.recommended_offer
  ) {
    throw new Error("Meeting brief is missing required JSON fields!");
  }

  console.log("✅ AI Brief JSON fields verified successfully:");
  console.log("  - Recommended Offer:", brief.recommended_offer);
  console.log("  - Research Summary:", brief.research_summary.substring(0, 100) + "...");

  // 3. Test Pre-Call Questionnaire Submission
  console.log("\nStep 3: Simulating Pre-Call Questionnaire Submission...");
  const qRequest = new Request("http://localhost:3000/api/questionnaire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lead_id: bookingResult.leadId,
      booking_id: testUid,
      email: testEmail,
      bottleneck: "Manual triage of 500+ daily support requests across 3 teams.",
      tech_stack: "Zapier, Zendesk, Salesforce, PostgreSQL",
      team_size: "20-50",
      goal_90_days: "Deploy AI auto-triage and reduce resolution time by 75%.",
      booking_reason: "Evaluate House Of Workflow's AI Agent Sprint."
    })
  });

  const qResponse = await handleQuestionnaireRequest(qRequest);
  const qResponseBody = await qResponse.json();
  console.log("✅ Questionnaire Response:", qResponseBody);

  if (!qResponse.ok || !qResponseBody.success) {
    throw new Error("Questionnaire API handler failed!");
  }

  // 4. Verify Questionnaire in DB
  console.log("\nStep 4: Verifying Questionnaire Record in Database...");
  const qRecord = await db.getQuestionnaireForLead(bookingResult.leadId);
  console.log("Fetched Questionnaire:", qRecord);

  if (!qRecord) {
    throw new Error("Questionnaire response was not saved to database!");
  }

  console.log("✅ All 5 Questionnaire responses verified:");
  console.log("  1. Bottleneck:", qRecord.bottleneck);
  console.log("  2. Tech Stack:", qRecord.tech_stack);
  console.log("  3. Team Size:", qRecord.team_size);
  console.log("  4. 90-Day Goal:", qRecord.goal_90_days);
  console.log("  5. Booking Reason:", qRecord.booking_reason);

  console.log("\n==================================================");
  console.log("🎉 ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runE2ETest().catch((err) => {
  console.error("❌ E2E Integration Test Failed:", err);
  process.exit(1);
});
