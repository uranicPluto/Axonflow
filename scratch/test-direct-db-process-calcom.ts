import fs from "node:fs";
import path from "node:path";

// Load .env BEFORE any imports
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

// Set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY explicitly
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}
process.env.ENABLE_PROVIDER_MOCKS = "true";

// Import supabase module dynamically after process.env is set
import { getSupabaseAdmin, isSupabaseEnabled } from "../src/server/supabase";
import { db } from "../src/server/db";

async function testDirectProcessCalcomBooking() {
  console.log("==================================================");
  console.log("TESTING DB.PROCESSCALCOMBOOKING WITH FULL ENV LOAD");
  console.log("==================================================\n");

  console.log("Environment State:");
  console.log("  SUPABASE_URL:", process.env.SUPABASE_URL);
  console.log("  isSupabaseEnabled:", isSupabaseEnabled);
  console.log("  getSupabaseAdmin() present:", !!getSupabaseAdmin());

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const testBookingId = 23789137;
  const testUid = "23789137";
  const testEmail = "jaymahajan987@gmail.com";

  // Clean up any pre-existing test records
  await supabase.from("bookings").delete().eq("cal_booking_uid", testUid);
  await supabase.from("leads").delete().eq("email", testEmail);
  await supabase.from("workflow_events").delete().eq("event_id", `BOOKING_CREATED:${testUid}`);

  const payload = {
    triggerEvent: "BOOKING_CREATED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: testBookingId,
      uid: testUid,
      title: "House Of Workflow Discovery Call",
      eventTitle: "House Of Workflow Discovery Call",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 88200000).toISOString(),
      organizer: {
        name: "Jay Mahajan",
        email: "jay@houseofworkflow.com",
        timeZone: "Asia/Kolkata"
      },
      attendees: [
        {
          name: "Jay Mahajan",
          email: testEmail,
          timeZone: "Asia/Kolkata"
        }
      ]
    }
  };

  console.log("\n1. Calling db.processCalcomBooking(payload)...");
  const result = await db.processCalcomBooking(payload);
  console.log("   Result:", JSON.stringify(result, null, 2));

  // Verify in Supabase
  console.log("\n2. Querying Supabase for created records...");

  const { data: leadRows } = await supabase.from("leads").select("*").eq("email", testEmail);
  const { data: bookingRows } = await supabase.from("bookings").select("*").eq("cal_booking_uid", testUid);
  const { data: wfRows } = await supabase.from("workflow_events").select("*").eq("event_id", `BOOKING_CREATED:${testUid}`);

  console.log("\n   [SUPABASE INSERT EVIDENCE]");
  console.log("   - Lead Record Created:", leadRows?.length ? "YES" : "NO");
  if (leadRows && leadRows.length > 0) {
    console.log("     Lead ID:", leadRows[0].id);
    console.log("     Lead Name:", leadRows[0].name);
    console.log("     Lead Email:", leadRows[0].email);
    console.log("     Lead Status:", leadRows[0].status);
  }

  console.log("   - Booking Record Created:", bookingRows?.length ? "YES" : "NO");
  if (bookingRows && bookingRows.length > 0) {
    console.log("     Booking ID:", bookingRows[0].id);
    console.log("     Booking Title:", bookingRows[0].title);
    console.log("     Booking Status:", bookingRows[0].status);
  }

  console.log("   - Workflow Event Claimed:", wfRows?.length ? "YES" : "NO");
  if (wfRows && wfRows.length > 0) {
    console.log("     Event ID:", wfRows[0].event_id);
    console.log("     Event Status:", wfRows[0].status);
  }
}

testDirectProcessCalcomBooking().catch(console.error);
