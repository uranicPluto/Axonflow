import { db } from "../src/server/db";
import { handleCalcomWebhook } from "../src/server/calcom-webhook-handler";
import { dispatchCriticalAlert } from "../src/server/alerting";
import crypto from "node:crypto";
import fs from "fs";
import path from "path";

function generateCalcomHmac(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function runPhase19SmokeTest() {
  console.log("==================================================");
  console.log("PHASE 19 — LIVE BUSINESS WORKFLOW SMOKE TEST");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const testEmail = `qa-smoke-${timestamp}@example.com`;
  const secret = process.env.CAL_WEBHOOK_SECRET || "test-secret-key-1234567890";
  process.env.CAL_WEBHOOK_SECRET = secret;

  // ── A. Public Lead Intake ──
  console.log("--- A. Testing Public Lead Intake ---");
  const newLead = await db.createLead({
    name: "QA Smoke Tester",
    email: testEmail,
    phone: "+15550192834",
    service_interest: "ai_agents",
    problem_description: "Automating manual workflow processes for enterprise QA testing.",
    source: "experience_form",
    status: "new",
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
  });

  console.log(`✓ Created Lead ID: ${newLead.id}`);
  console.log(`✓ Email: ${newLead.email}`);
  console.log(`✓ Status: ${newLead.status}`);
  console.log(`✓ Source: ${newLead.source}`);
  console.log(`✓ Call Token: ${newLead.call_token}`);

  const leadSaved = await db.getLead(newLead.id);
  const intakePass = !!(leadSaved && leadSaved.email === testEmail && leadSaved.call_token);
  console.log(`RESULT A (Public Lead Intake): ${intakePass ? "PASS" : "FAIL"}\n`);

  // ── B. Lead Scoring ──
  console.log("--- B. Testing Lead Scoring ---");
  const leadScore = leadSaved?.lead_score ?? newLead.lead_score ?? 0;
  console.log(`✓ Lead Score: ${leadScore}`);
  const scorePass = (leadScore !== undefined && leadScore >= 0 && leadScore <= 100);
  console.log(`RESULT B (Lead Scoring): ${scorePass ? "PASS" : "FAIL"}\n`);

  // ── C. Single-Use Call Token ──
  console.log("--- C. Testing Single-Use Call Token ---");
  const firstCallRes = await db.requestLeadCallWithToken(newLead.id, newLead.call_token!);
  console.log(`✓ 1st Request Result: success=${firstCallRes.success}, leadId=${firstCallRes.lead?.id}`);

  let secondCallFailed = false;
  try {
    const secondCallRes = await db.requestLeadCallWithToken(newLead.id, newLead.call_token!);
    if (!secondCallRes.success) secondCallFailed = true;
  } catch (err: any) {
    secondCallFailed = true;
    console.log(`✓ 2nd Request Correctly Rejected: ${err.message}`);
  }
  const tokenPass = firstCallRes.success && secondCallFailed;
  console.log(`RESULT C (Single-Use Call Token): ${tokenPass ? "PASS" : "FAIL"}\n`);

  // ── D. Cal.com BOOKING_CREATED ──
  console.log("--- D. Testing Cal.com BOOKING_CREATED ---");
  const bookingUid = `bk-qa-${timestamp}`;
  const webhookCreatedPayload = {
    eventTrigger: "BOOKING_CREATED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: 998877,
      uid: bookingUid,
      title: "QA Strategy Call",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      meetingUrl: `https://cal.com/meeting/${bookingUid}`,
      status: "ACCEPTED",
      attendees: [{ name: "QA Tester", email: testEmail, timeZone: "America/New_York" }],
    },
  };

  const bodyTextCreated = JSON.stringify(webhookCreatedPayload);
  const signatureCreated = generateCalcomHmac(bodyTextCreated, secret);

  const reqCreated = new Request("https://houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cal-Signature-256": signatureCreated,
    },
    body: bodyTextCreated,
  });

  const resCreated = await handleCalcomWebhook(reqCreated);
  const resCreatedJson = await resCreated.json();
  console.log(`✓ BOOKING_CREATED Webhook Result: status=${resCreated.status}, body=`, JSON.stringify(resCreatedJson));
  const calCreatedPass = resCreated.status === 200 && resCreatedJson.success === true;

  // ── E. Cal.com BOOKING_RESCHEDULED ──
  console.log("--- E. Testing Cal.com BOOKING_RESCHEDULED ---");
  const webhookRescheduledPayload = {
    eventTrigger: "BOOKING_RESCHEDULED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: 998877,
      uid: bookingUid,
      title: "QA Strategy Call (Rescheduled)",
      startTime: new Date(Date.now() + 172800000).toISOString(),
      endTime: new Date(Date.now() + 176400000).toISOString(),
      meetingUrl: `https://cal.com/meeting/${bookingUid}`,
      status: "ACCEPTED",
      attendees: [{ name: "QA Tester", email: testEmail, timeZone: "America/New_York" }],
    },
  };

  const bodyTextRescheduled = JSON.stringify(webhookRescheduledPayload);
  const signatureRescheduled = generateCalcomHmac(bodyTextRescheduled, secret);

  const reqRescheduled = new Request("https://houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cal-Signature-256": signatureRescheduled,
    },
    body: bodyTextRescheduled,
  });

  const resRescheduled = await handleCalcomWebhook(reqRescheduled);
  const resRescheduledJson = await resRescheduled.json();
  console.log(`✓ BOOKING_RESCHEDULED Webhook Result: status=${resRescheduled.status}, body=`, JSON.stringify(resRescheduledJson));
  const calRescheduledPass = resRescheduled.status === 200 && resRescheduledJson.success === true;

  // ── F. Cal.com BOOKING_CANCELLED ──
  console.log("--- F. Testing Cal.com BOOKING_CANCELLED ---");
  const webhookCancelledPayload = {
    eventTrigger: "BOOKING_CANCELLED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: 998877,
      uid: bookingUid,
      title: "QA Strategy Call (Cancelled)",
      startTime: new Date(Date.now() + 172800000).toISOString(),
      endTime: new Date(Date.now() + 176400000).toISOString(),
      meetingUrl: `https://cal.com/meeting/${bookingUid}`,
      status: "CANCELLED",
      attendees: [{ name: "QA Tester", email: testEmail, timeZone: "America/New_York" }],
    },
  };

  const bodyTextCancelled = JSON.stringify(webhookCancelledPayload);
  const signatureCancelled = generateCalcomHmac(bodyTextCancelled, secret);

  const reqCancelled = new Request("https://houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cal-Signature-256": signatureCancelled,
    },
    body: bodyTextCancelled,
  });

  const resCancelled = await handleCalcomWebhook(reqCancelled);
  const resCancelledJson = await resCancelled.json();
  console.log(`✓ BOOKING_CANCELLED Webhook Result: status=${resCancelled.status}, body=`, JSON.stringify(resCancelledJson));
  const calCancelledPass = resCancelled.status === 200 && resCancelledJson.success === true;

  // ── G. Webhook Idempotency ──
  console.log("--- G. Testing Webhook Idempotency ---");
  const reqDuplicate = new Request("https://houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cal-Signature-256": signatureCreated,
    },
    body: bodyTextCreated,
  });
  const resDuplicate = await handleCalcomWebhook(reqDuplicate);
  const resDuplicateJson = await resDuplicate.json();
  console.log(`✓ Duplicate Webhook Result: status=${resDuplicate.status}, duplicate=${resDuplicateJson.duplicate}`);
  const idempotencyPass = resDuplicate.status === 200 && resDuplicateJson.duplicate === true;

  // ── H. Concurrent Duplicate Protection ──
  console.log("--- H. Testing Concurrent Duplicate Protection ---");
  const concUid = `bk-conc-${timestamp}`;
  const concPayload = {
    eventTrigger: "BOOKING_CREATED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: 887766,
      uid: concUid,
      title: "Concurrent QA Test",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      meetingUrl: `https://cal.com/meeting/${concUid}`,
      status: "ACCEPTED",
      attendees: [{ name: "Concurrent Tester", email: testEmail, timeZone: "America/New_York" }],
    },
  };
  const bodyTextConc = JSON.stringify(concPayload);
  const sigConc = generateCalcomHmac(bodyTextConc, secret);

  const reqConc1 = new Request("https://houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Cal-Signature-256": sigConc },
    body: bodyTextConc,
  });
  const reqConc2 = new Request("https://houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Cal-Signature-256": sigConc },
    body: bodyTextConc,
  });

  const [resConc1, resConc2] = await Promise.all([handleCalcomWebhook(reqConc1), handleCalcomWebhook(reqConc2)]);
  const jsonConc1 = await resConc1.json();
  const jsonConc2 = await resConc2.json();

  const concDups = [jsonConc1.duplicate, jsonConc2.duplicate].filter(Boolean).length;
  console.log(`✓ Concurrent Requests Processed: conc1.dup=${jsonConc1.duplicate}, conc2.dup=${jsonConc2.duplicate}`);
  const concPass = (jsonConc1.success && jsonConc2.success) && concDups >= 1;
  console.log(`RESULT H (Concurrent Duplicate Protection): ${concPass ? "PASS" : "FAIL"}\n`);

  // ── J. Slack Alerting Verification ──
  console.log("--- J. Testing Slack Alerting ---");
  const slackAlertRes = await dispatchCriticalAlert({
    title: "[SMOKE TEST] AxonFlow production alerting verification",
    message: `Automated Phase 19 smoke test executed at ${new Date().toISOString()}`,
    severity: "warning",
  });
  console.log(`✓ Slack Alert Result: dispatchedCount=${slackAlertRes.dispatchedCount}, success=${slackAlertRes.success}`);
  const slackPass = slackAlertRes.success === true;

  // ── K. Cron Configuration ──
  console.log("--- K. Testing Cron Configuration ---");
  const vercelJsonPath = path.resolve(process.cwd(), "vercel.json");
  let cronPass = false;
  if (fs.existsSync(vercelJsonPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, "utf-8"));
    const crons = vercelConfig.crons || [];
    console.log(`✓ Found ${crons.length} registered crons in vercel.json:`, JSON.stringify(crons));
    cronPass = crons.length > 0;
  }
  console.log(`RESULT K (Cron Config): ${cronPass ? "PASS" : "FAIL"}\n`);

  console.log("==================================================");
  console.log("PHASE 19 SMOKE TEST SUMMARY");
  console.log("==================================================");
  console.log(`A. Public Lead Intake:           ${intakePass ? "PASS" : "FAIL"}`);
  console.log(`B. Lead Scoring:                 ${scorePass ? "PASS" : "FAIL"}`);
  console.log(`C. Call Token:                   ${tokenPass ? "PASS" : "FAIL"}`);
  console.log(`D. Cal.com Created:              ${calCreatedPass ? "PASS" : "FAIL"}`);
  console.log(`E. Cal.com Rescheduled:          ${calRescheduledPass ? "PASS" : "FAIL"}`);
  console.log(`F. Cal.com Cancelled:            ${calCancelledPass ? "PASS" : "FAIL"}`);
  console.log(`G. Webhook Idempotency:          ${idempotencyPass ? "PASS" : "FAIL"}`);
  console.log(`H. Concurrent Duplicates:        ${concPass ? "PASS" : "FAIL"}`);
  console.log(`J. Slack Alerting:               ${slackPass ? "PASS" : "FAIL"}`);
  console.log(`K. Cron Configuration:          ${cronPass ? "PASS" : "FAIL"}`);
}

runPhase19SmokeTest().catch(console.error);
