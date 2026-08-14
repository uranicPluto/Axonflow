/**
 * Flow A Phase 1 (Production Booking Capture) E2E Test Suite
 * Verifies all 10 required testing proof checkpoints.
 */

import { db } from "../src/server/db";

async function runFlowATests() {
  console.log("=== FLOW A PHASE 1 PRODUCTION BOOKING CAPTURE TEST ===\n");

  const timestamp = Date.now();
  const testEmail = `flowa.client.${timestamp}@houseofworkflow.com`;
  const testPhone = "+919988776655";
  const bookingUid = `bk-flowa-${timestamp}`;
  const meetingTime = new Date(Date.now() + 86400000).toISOString();
  const meetingLink = `https://cal.com/meeting/flowa-${timestamp}`;

  // -------------------------------------------------------------
  // [1/10] BOOKING_CREATED creates lead
  // -------------------------------------------------------------
  const payloadCreated = {
    eventTrigger: "BOOKING_CREATED",
    payload: {
      uid: bookingUid,
      eventTitle: "House Of Workflow Discovery Call",
      startTime: meetingTime,
      timezone: "Asia/Kolkata",
      location: meetingLink,
      attendees: [
        {
          name: "Vikram Malhotra",
          email: testEmail,
          phoneNumber: testPhone,
          timeZone: "Asia/Kolkata",
        },
      ],
      responses: {
        problem: "We need automated client intake and instant scheduling",
      },
    },
  };

  const resCreated = await db.processCalcomBooking(payloadCreated);
  if (!resCreated || !resCreated.success) {
    throw new Error(`BOOKING_CREATED failed to execute: ${JSON.stringify(resCreated)}`);
  }

  const createdLead = await db.findLeadByIdentity(testEmail, testPhone, bookingUid);
  if (!createdLead || !createdLead.id) {
    throw new Error("Proof 1 Failed: Lead was not created in database");
  }
  if (createdLead.source !== "book_a_call" || createdLead.status !== "meeting_booked") {
    throw new Error(`Proof 1 Failed: Lead attributes incorrect (${createdLead.source}, ${createdLead.status})`);
  }
  console.log(`[1/10] BOOKING_CREATED creates lead ✓ (Lead ID: ${createdLead.id}, Source: ${createdLead.source}, Status: ${createdLead.status})`);

  // -------------------------------------------------------------
  // [2/10] BOOKING_CREATED creates meeting
  // -------------------------------------------------------------
  const meeting = await db.getMeetingByUid(bookingUid);
  if (!meeting || meeting.lead_id !== createdLead.id || meeting.status !== "scheduled") {
    throw new Error("Proof 2 Failed: Meeting row not properly created/associated");
  }
  console.log(`[2/10] BOOKING_CREATED creates meeting ✓ (Meeting ID: ${meeting.id}, Status: ${meeting.status})`);

  // -------------------------------------------------------------
  // [3/10] Client WhatsApp sent & logged to communication_logs
  // -------------------------------------------------------------
  const clientWaKey = `booking_confirmation_whatsapp:${bookingUid}`;
  const clientWaLog = await db.getCommunicationLog(clientWaKey);
  if (!clientWaLog) {
    throw new Error("Proof 3 Failed: Client WhatsApp communication_log entry missing");
  }
  console.log(`[3/10] Client WhatsApp sent ✓ (Key: ${clientWaKey}, Status: ${clientWaLog.status})`);

  // -------------------------------------------------------------
  // [4/10] Client email sent & logged to communication_logs
  // -------------------------------------------------------------
  const clientEmailKey = `booking_confirmation_email:${bookingUid}`;
  const clientEmailLog = await db.getCommunicationLog(clientEmailKey);
  if (!clientEmailLog) {
    throw new Error("Proof 4 Failed: Client Email communication_log entry missing");
  }
  console.log(`[4/10] Client email sent ✓ (Key: ${clientEmailKey}, Status: ${clientEmailLog.status})`);

  // -------------------------------------------------------------
  // [5/10] Founder WhatsApp sent & logged to communication_logs
  // -------------------------------------------------------------
  const founderWaKey = `jay_booking_alert:${bookingUid}`;
  const founderWaLog = await db.getCommunicationLog(founderWaKey);
  if (!founderWaLog) {
    throw new Error("Proof 5 Failed: Founder WhatsApp communication_log entry missing");
  }
  console.log(`[5/10] Founder WhatsApp sent ✓ (Key: ${founderWaKey}, Status: ${founderWaLog.status})`);

  // -------------------------------------------------------------
  // [6/10] Founder email sent & logged to communication_logs
  // -------------------------------------------------------------
  const founderEmailKey = `jay_booking_email:${bookingUid}`;
  const founderEmailLog = await db.getCommunicationLog(founderEmailKey);
  if (!founderEmailLog) {
    throw new Error("Proof 6 Failed: Founder Email communication_log entry missing");
  }
  console.log(`[6/10] Founder email sent ✓ (Key: ${founderEmailKey}, Status: ${founderEmailLog.status})`);

  // -------------------------------------------------------------
  // [7/10] Duplicate webhook ignored
  // -------------------------------------------------------------
  const duplicateRes = await db.processCalcomBooking(payloadCreated);
  if (!duplicateRes || !duplicateRes.duplicate) {
    throw new Error("Proof 7 Failed: Duplicate webhook call was not ignored");
  }
  console.log(`[7/10] Duplicate webhook ignored ✓ (Duplicate Flag: ${duplicateRes.duplicate})`);

  // -------------------------------------------------------------
  // [8/10] BOOKING_RESCHEDULED updates meeting
  // -------------------------------------------------------------
  const rescheduledTime = new Date(Date.now() + 172800000).toISOString();
  const payloadRescheduled = {
    eventTrigger: "BOOKING_RESCHEDULED",
    payload: {
      uid: bookingUid,
      eventTitle: "House Of Workflow Discovery Call",
      startTime: rescheduledTime,
      timezone: "Asia/Kolkata",
      location: meetingLink,
      attendees: [
        {
          name: "Vikram Malhotra",
          email: testEmail,
          phoneNumber: testPhone,
          timeZone: "Asia/Kolkata",
        },
      ],
    },
  };

  const resRescheduled = await db.processCalcomBooking(payloadRescheduled);
  if (!resRescheduled || !resRescheduled.success) {
    throw new Error("BOOKING_RESCHEDULED failed to execute");
  }

  const rescheduledMeeting = await db.getMeetingByUid(bookingUid);
  if (!rescheduledMeeting || rescheduledMeeting.status !== "rescheduled") {
    throw new Error("Proof 8 Failed: Meeting status was not updated to rescheduled");
  }
  console.log(`[8/10] BOOKING_RESCHEDULED updates meeting ✓ (Status: ${rescheduledMeeting.status}, ScheduledAt: ${rescheduledMeeting.scheduled_at})`);

  // -------------------------------------------------------------
  // [9/10] BOOKING_CANCELLED updates meeting
  // -------------------------------------------------------------
  const payloadCancelled = {
    eventTrigger: "BOOKING_CANCELLED",
    payload: {
      uid: bookingUid,
      eventTitle: "House Of Workflow Discovery Call",
      attendees: [
        {
          name: "Vikram Malhotra",
          email: testEmail,
          phoneNumber: testPhone,
        },
      ],
    },
  };

  const resCancelled = await db.processCalcomBooking(payloadCancelled);
  if (!resCancelled || !resCancelled.success) {
    throw new Error("BOOKING_CANCELLED failed to execute");
  }

  const cancelledMeeting = await db.getMeetingByUid(bookingUid);
  if (!cancelledMeeting || cancelledMeeting.status !== "cancelled") {
    throw new Error("Proof 9 Failed: Meeting status was not updated to cancelled");
  }
  console.log(`[9/10] BOOKING_CANCELLED updates meeting ✓ (Status: ${cancelledMeeting.status})`);

  // -------------------------------------------------------------
  // [10/10] webhook_events processed correctly
  // -------------------------------------------------------------
  const webhookEventLog = await db.getWebhookEventLog("calcom", `BOOKING_CREATED:${bookingUid}`);
  if (!webhookEventLog || !webhookEventLog.processed) {
    throw new Error("Proof 10 Failed: webhook_events entry not marked as processed");
  }
  console.log(`[10/10] webhook_events processed correctly ✓ (Processed: ${webhookEventLog.processed}, Lead ID: ${webhookEventLog.lead_id})`);

  console.log("\nALL TESTS PASSED");
  console.log("FLOW A PHASE 1 PRODUCTION BOOKING CAPTURE COMPLETE");
}

runFlowATests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
