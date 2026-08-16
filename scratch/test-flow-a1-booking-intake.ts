/**
 * Flow A1 - Booking Intake Test & Verification Script
 * Simulates real Cal.com booking -> Lead Upsert -> Meeting Creation -> Bolna Call Trigger -> Call Log
 */

import { db } from "../src/server/db";
import { triggerBolnaQualificationCall } from "../src/server/bolna-voice-engine";

async function testFlowA1BookingIntake() {
  console.log("=== FLOW A1 - BOOKING INTAKE TEST ===\n");

  const timestamp = Date.now();
  const testEmail = `a1.intake.${timestamp}@houseofworkflow.com`;
  const testPhone = "+919876501234";
  const bookingUid = `bk-a1-${timestamp}`;
  const meetingTime = new Date(Date.now() + 86400000).toISOString();
  const meetingLink = `https://cal.com/meeting/a1-${timestamp}`;

  // 1. Intake Payload
  const rawPayload = {
    eventTrigger: "BOOKING_CREATED",
    payload: {
      uid: bookingUid,
      eventTitle: "House Of Workflow Discovery Call",
      startTime: meetingTime,
      timezone: "Asia/Kolkata",
      location: meetingLink,
      attendees: [
        {
          name: "Siddharth Mehta",
          email: testEmail,
          phoneNumber: testPhone,
          timeZone: "Asia/Kolkata",
        },
      ],
      responses: {
        problem: "Automate outbound lead intake and booking pipeline",
      },
    },
  };

  // 2. Normalize Data
  const attendee = rawPayload.payload.attendees[0];
  const normalizedData = {
    booking_uid: bookingUid,
    name: attendee.name,
    email: attendee.email.toLowerCase().trim(),
    phone: attendee.phoneNumber,
    meeting_time: rawPayload.payload.startTime,
    timezone: attendee.timeZone,
    meeting_link: rawPayload.payload.location,
    notes: rawPayload.payload.responses.problem,
  };

  console.log("1. Normalized Intake Parameters:", JSON.stringify(normalizedData, null, 2));

  // 3. Upsert Lead into Supabase
  const leadRecord: any = {
    name: normalizedData.name,
    first_name: normalizedData.name.split(" ")[0],
    email: normalizedData.email,
    phone: normalizedData.phone,
    source: "book_a_call",
    status: "meeting_booked",
    cal_booking_uid: normalizedData.booking_uid,
    meeting_datetime: normalizedData.meeting_time,
    meeting_timezone: normalizedData.timezone,
    meeting_link: normalizedData.meeting_link,
    meeting_confirmed: true,
    meeting_status: "scheduled",
    reminder_sent: false,
    updated_at: new Date().toISOString(),
  };

  let lead = await db.findLeadByIdentity(normalizedData.email, normalizedData.phone, normalizedData.booking_uid);
  if (!lead) {
    lead = await db.createLead(leadRecord);
  }
  console.log("\n2. Supabase Lead Created/Upserted:", {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
  });

  // 4. Create Meeting Record in Supabase
  await db.upsertMeeting(
    lead.id,
    normalizedData.booking_uid,
    normalizedData.meeting_time,
    normalizedData.timezone,
    normalizedData.meeting_link,
    "scheduled"
  );
  const meeting = await db.getMeetingByUid(normalizedData.booking_uid);

  console.log("\n3. Supabase Meeting Created:", {
    id: meeting.id,
    lead_id: meeting.lead_id,
    cal_uid: meeting.cal_uid,
    scheduled_at: meeting.scheduled_at,
    status: meeting.status,
  });

  // 5. Trigger Outbound Bolna Call
  const bolnaRes = await triggerBolnaQualificationCall({
    leadId: lead.id,
    phone: normalizedData.phone,
    leadName: normalizedData.name,
    leadEmail: normalizedData.email,
    flowType: "book_a_call",
    meetingDateTime: `${normalizedData.meeting_time} (${normalizedData.timezone})`,
  });

  console.log("\n4. Bolna API Outbound Call Request & Response:", {
    requestPayload: {
      agent_id: process.env.BOLNA_AGENT_ID || "houseofworkflow-sdr-v1",
      recipient_phone_number: normalizedData.phone,
      user_data: {
        lead_id: lead.id,
        booking_uid: normalizedData.booking_uid,
        name: normalizedData.name,
        email: normalizedData.email,
      },
    },
    response: bolnaRes,
  });

  // 6. Save Call Record in Supabase
  const commClaimKey = `bolna_call:${normalizedData.booking_uid}`;
  await db.claimCommunication(commClaimKey, lead.id, "voice", "bolna", undefined, "outbound_qualification_call");
  await db.updateCommunicationStatus(commClaimKey, "dispatched", bolnaRes.callSid || "mock-bolna-id");

  const callLog = await db.getCommunicationLog(commClaimKey);
  console.log("\n5. Supabase Communication Log Saved:", callLog);

  console.log("\nFLOW A1 - BOOKING INTAKE TEST COMPLETE ✓");
}

testFlowA1BookingIntake().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
