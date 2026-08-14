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
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}

async function testProcessCalcomBooking() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const { db } = await import("../src/server/db");

  const client = getSupabaseAdmin();
  if (!client) return;

  console.log("==========================================");
  console.log("TESTING DB.PROCESSCALCOMBOOKING IN SUPABASE");
  console.log("==========================================\n");

  const testUid = `cal-e2e-${Date.now()}`;
  const testEmail = `e2e-calcom-${Date.now()}@example.com`;
  const startTime = new Date(Date.now() + 86400000).toISOString();

  // 1. Test BOOKING_CREATED
  console.log("--- 1. Testing BOOKING_CREATED ---");
  const payloadCreated = {
    eventTrigger: "BOOKING_CREATED",
    createdAt: new Date().toISOString(),
    payload: {
      id: 998877,
      uid: testUid,
      title: "House Of Workflow Discovery Call",
      startTime,
      meetingUrl: "https://cal.com/jay-mahajan-euwk62/j",
      attendees: [
        {
          name: "Calcom E2E Tester",
          email: testEmail,
          phoneNumber: "+919876543210",
          timeZone: "Asia/Kolkata"
        }
      ]
    }
  };

  const resCreated = await db.processCalcomBooking(payloadCreated);
  console.log("✓ BOOKING_CREATED result:", JSON.stringify(resCreated, null, 2));

  // Query Supabase to confirm lead and booking created
  const { data: lead1 } = await client.from("leads").select("*").eq("cal_booking_uid", testUid).single();
  const { data: bk1 } = await client.from("bookings").select("*").eq("cal_booking_uid", testUid).single();
  const { data: wf1 } = await client.from("workflow_events").select("*").eq("event_id", `BOOKING_CREATED:${testUid}`).single();

  console.log("   Lead in Supabase:", lead1 ? `YES (ID: ${lead1.id}, email: ${lead1.email})` : "NO");
  console.log("   Booking in Supabase:", bk1 ? `YES (ID: ${bk1.id}, status: ${bk1.status})` : "NO");
  console.log("   Workflow Event in Supabase:", wf1 ? `YES (ID: ${wf1.id}, status: ${wf1.status})` : "NO");

  // 2. Test Duplicate BOOKING_CREATED
  console.log("\n--- 2. Testing Duplicate BOOKING_CREATED ---");
  const resDup = await db.processCalcomBooking(payloadCreated);
  console.log("✓ Duplicate result:", JSON.stringify(resDup, null, 2));

  // 3. Test BOOKING_RESCHEDULED
  console.log("\n--- 3. Testing BOOKING_RESCHEDULED ---");
  const newStartTime = new Date(Date.now() + 172800000).toISOString();
  const payloadResched = {
    eventTrigger: "BOOKING_RESCHEDULED",
    createdAt: new Date().toISOString(),
    payload: {
      id: 998877,
      uid: testUid,
      title: "House Of Workflow Discovery Call",
      startTime: newStartTime,
      meetingUrl: "https://cal.com/jay-mahajan-euwk62/j?rescheduled=1",
      attendees: [
        {
          name: "Calcom E2E Tester",
          email: testEmail,
          phoneNumber: "+919876543210",
          timeZone: "Asia/Kolkata"
        }
      ]
    }
  };

  const resResched = await db.processCalcomBooking(payloadResched);
  console.log("✓ BOOKING_RESCHEDULED result:", JSON.stringify(resResched, null, 2));

  const { data: bk2 } = await client.from("bookings").select("*").eq("cal_booking_uid", testUid).single();
  console.log("   Booking status after reschedule:", bk2?.status, "| start_time:", bk2?.start_time);

  // 4. Test BOOKING_CANCELLED
  console.log("\n--- 4. Testing BOOKING_CANCELLED ---");
  const payloadCancel = {
    eventTrigger: "BOOKING_CANCELLED",
    createdAt: new Date().toISOString(),
    payload: {
      id: 998877,
      uid: testUid,
      title: "House Of Workflow Discovery Call",
      startTime: newStartTime,
      attendees: [
        {
          name: "Calcom E2E Tester",
          email: testEmail
        }
      ]
    }
  };

  const resCancel = await db.processCalcomBooking(payloadCancel);
  console.log("✓ BOOKING_CANCELLED result:", JSON.stringify(resCancel, null, 2));

  const { data: bk3 } = await client.from("bookings").select("*").eq("cal_booking_uid", testUid).single();
  const { data: lead3 } = await client.from("leads").select("*").eq("cal_booking_uid", testUid).single();
  console.log("   Booking status after cancel:", bk3?.status);
  console.log("   Lead meeting_status after cancel:", lead3?.meeting_status, "| confirmed:", lead3?.meeting_confirmed);

  // Cleanup
  console.log("\n--- Cleaning up test records ---");
  if (bk3) await client.from("bookings").delete().eq("id", bk3.id);
  if (lead3) await client.from("leads").delete().eq("id", lead3.id);
  await client.from("workflow_events").delete().like("event_id", `%:${testUid}`);
  console.log("✓ Cleanup complete!");
}

testProcessCalcomBooking().catch(console.error);
