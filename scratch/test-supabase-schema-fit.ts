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

async function testSchemaFit() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) {
    console.error("No Supabase client");
    return;
  }

  console.log("==========================================");
  console.log("TESTING EXACT SUPABASE SCHEMA WRITES");
  console.log("==========================================\n");

  const testUid = `cal-uid-${Date.now()}`;
  const testEmail = `lead-test-${Date.now()}@example.com`;
  const nowStr = new Date().toISOString();

  // 1. Test workflow_events claim
  console.log("--- 1. Testing workflow_events insert ---");
  const { data: wfData, error: wfErr } = await client
    .from("workflow_events")
    .insert([{
      event_id: `BOOKING_CREATED:${testUid}`,
      source: "calcom",
      event_type: "BOOKING_CREATED",
      payload: { test: true },
      status: "claimed",
      attempt_count: 1,
      created_at: nowStr
    }])
    .select()
    .single();

  if (wfErr) {
    console.error("❌ workflow_events error:", wfErr);
  } else {
    console.log("✅ workflow_events insert SUCCESS! ID:", wfData.id);
  }

  // 2. Test leads insert
  console.log("\n--- 2. Testing leads insert ---");
  const { data: leadData, error: leadErr } = await client
    .from("leads")
    .insert([{
      name: "Supabase Test Lead",
      first_name: "Supabase",
      email: testEmail,
      phone: "+919876543210",
      source: "book_a_call",
      status: "meeting_booked",
      cal_booking_uid: testUid,
      meeting_datetime: nowStr,
      meeting_timezone: "Asia/Kolkata",
      meeting_link: "https://cal.com/test",
      meeting_confirmed: true,
      meeting_status: "scheduled",
      reminder_sent: false,
      created_at: nowStr,
      updated_at: nowStr
    }])
    .select()
    .single();

  if (leadErr) {
    console.error("❌ leads insert error:", leadErr);
  } else {
    console.log("✅ leads insert SUCCESS! Lead ID:", leadData.id);
  }

  // 3. Test bookings insert
  console.log("\n--- 3. Testing bookings insert ---");
  let bkId: string | null = null;
  if (leadData) {
    const { data: bkData, error: bkErr } = await client
      .from("bookings")
      .insert([{
        lead_id: leadData.id,
        cal_booking_uid: testUid,
        title: "House Of Workflow Discovery Call",
        status: "scheduled",
        start_time: nowStr,
        end_time: new Date(Date.now() + 1800000).toISOString(),
        timezone: "Asia/Kolkata",
        meeting_link: "https://cal.com/test",
        created_at: nowStr,
        updated_at: nowStr
      }])
      .select()
      .single();

    if (bkErr) {
      console.error("❌ bookings insert error:", bkErr);
    } else {
      console.log("✅ bookings insert SUCCESS! Booking ID:", bkData.id);
      bkId = bkData.id;
    }
  }

  // 4. Test workflow_events mark processed
  console.log("\n--- 4. Testing workflow_events update to processed ---");
  if (wfData) {
    const { error: wfUpdateErr } = await client
      .from("workflow_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString()
      })
      .eq("id", wfData.id);

    if (wfUpdateErr) {
      console.error("❌ workflow_events update error:", wfUpdateErr);
    } else {
      console.log("✅ workflow_events update to processed SUCCESS!");
    }
  }

  // Cleanup test data
  console.log("\n--- Cleaning up test records ---");
  if (wfData) await client.from("workflow_events").delete().eq("id", wfData.id);
  if (bkId) await client.from("bookings").delete().eq("id", bkId);
  if (leadData) await client.from("leads").delete().eq("id", leadData.id);
  console.log("✓ Cleanup complete!");
}

testSchemaFit().catch(console.error);
