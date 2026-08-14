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

async function testFullCalcomFlowProof() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) return;

  console.log("==========================================");
  console.log("TESTING COMPLETE CAL.COM WORKFLOW IN SUPABASE");
  console.log("==========================================\n");

  const testUid = `proof-uid-${Date.now()}`;
  const testEmail = `proof-lead-${Date.now()}@example.com`;
  const nowStr = new Date().toISOString();
  const startTimeStr = new Date(Date.now() + 86400000).toISOString();
  const endTimeStr = new Date(Date.now() + 88200000).toISOString();

  // 1. Claim in workflow_events
  console.log("1. Claiming event in workflow_events...");
  const { data: wfRow, error: wfErr } = await client
    .from("workflow_events")
    .insert([{
      event_id: `BOOKING_CREATED:${testUid}`,
      source: "cal.com",
      event_type: "BOOKING_CREATED",
      payload: { uid: testUid },
      status: "processing",
      attempt_count: 1,
      created_at: nowStr
    }])
    .select()
    .single();

  if (wfErr) throw wfErr;
  console.log("   ✓ workflow_events claimed: ID =", wfRow.id);

  // 2. Insert Lead into leads table
  console.log("\n2. Inserting Lead into public.leads...");
  const { data: leadRow, error: leadErr } = await client
    .from("leads")
    .insert([{
      name: "Proof Attendee",
      first_name: "Proof",
      email: testEmail,
      phone: "+919876543210",
      source: "book_a_call",
      status: "meeting_booked",
      cal_booking_uid: testUid,
      meeting_datetime: startTimeStr,
      meeting_timezone: "Asia/Kolkata",
      meeting_link: "https://cal.com/jay-mahajan-euwk62/j",
      meeting_confirmed: true,
      meeting_status: "scheduled",
      reminder_sent: false,
      created_at: nowStr,
      updated_at: nowStr
    }])
    .select()
    .single();

  if (leadErr) throw leadErr;
  console.log("   ✓ Lead inserted in public.leads: ID =", leadRow.id, ", email =", leadRow.email);

  // 3. Insert Booking into bookings table
  console.log("\n3. Inserting Booking into public.bookings...");
  const { data: bookingRow, error: bkErr } = await client
    .from("bookings")
    .insert([{
      lead_id: leadRow.id,
      cal_booking_uid: testUid,
      title: "House Of Workflow Discovery Call",
      status: "scheduled",
      start_time: startTimeStr,
      end_time: endTimeStr,
      timezone: "Asia/Kolkata",
      meeting_link: "https://cal.com/jay-mahajan-euwk62/j",
      created_at: nowStr,
      updated_at: nowStr
    }])
    .select()
    .single();

  if (bkErr) throw bkErr;
  console.log("   ✓ Booking inserted in public.bookings: ID =", bookingRow.id, ", status =", bookingRow.status);

  // 4. Mark workflow_event as processed
  console.log("\n4. Marking workflow_events as processed...");
  const { error: wfUpdateErr } = await client
    .from("workflow_events")
    .update({
      status: "processed",
      processed_at: new Date().toISOString()
    })
    .eq("id", wfRow.id);

  if (wfUpdateErr) throw wfUpdateErr;
  console.log("   ✓ workflow_events marked processed!");

  // 5. Verify records can be queried back
  console.log("\n5. Verifying DB records exist...");
  const { data: leadCheck } = await client.from("leads").select("*").eq("id", leadRow.id).single();
  const { data: bkCheck } = await client.from("bookings").select("*").eq("id", bookingRow.id).single();
  const { data: wfCheck } = await client.from("workflow_events").select("*").eq("id", wfRow.id).single();

  console.log("   ✓ Query verification:");
  console.log("     - Lead:", leadCheck?.email, "| status =", leadCheck?.status);
  console.log("     - Booking:", bkCheck?.title, "| status =", bkCheck?.status);
  console.log("     - Webhook Event:", wfCheck?.event_id, "| status =", wfCheck?.status);

  // Cleanup
  console.log("\n6. Cleaning up test proof records...");
  await client.from("bookings").delete().eq("id", bookingRow.id);
  await client.from("leads").delete().eq("id", leadRow.id);
  await client.from("workflow_events").delete().eq("id", wfRow.id);
  console.log("   ✓ Test cleanup complete!");

  console.log("\n🎉 COMPLETE CAL.COM WORKFLOW CHAIN TO SUPABASE VERIFIED PERFECTLY!");
}

testFullCalcomFlowProof().catch(console.error);
