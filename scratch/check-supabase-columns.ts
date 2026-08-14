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

async function checkColumns() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) return;

  console.log("==========================================");
  console.log("INSPECTING PRODUCTION SUPABASE TABLE COLUMNS");
  console.log("==========================================\n");

  // Check leads by inserting a temporary test lead and deleting it
  const dummyLeadId = `test-col-check-${Date.now()}`;
  const { data: leadData, error: leadErr } = await client
    .from("leads")
    .insert([{
      id: dummyLeadId,
      name: "Column Check",
      email: `col-check-${Date.now()}@example.com`,
      phone: "+919999999999",
      source: "book_a_call",
      status: "new",
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      call_token: `tok-${Date.now()}`,
      call_token_expires_at: new Date(Date.now() + 900000).toISOString(),
      call_token_used: false,
      call_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (leadErr) {
    console.error("❌ Error inserting dummy lead:", leadErr);
  } else {
    console.log("✅ 'leads' table columns:", Object.keys(leadData));
    await client.from("leads").delete().eq("id", dummyLeadId);
  }

  // Check bookings table by inserting a temporary test booking and deleting it
  const dummyBookingId = `test-bk-check-${Date.now()}`;
  const { data: bkData, error: bkErr } = await client
    .from("bookings")
    .insert([{
      id: dummyBookingId,
      lead_id: dummyLeadId,
      cal_event_id: "test-cal-id-123",
      scheduled_at: new Date().toISOString(),
      meeting_link: "https://cal.com/test",
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select();

  if (bkErr) {
    console.error("❌ Error inserting dummy booking:", bkErr);
  } else {
    console.log("✅ 'bookings' table columns:", Object.keys(bkData[0]));
    await client.from("bookings").delete().eq("id", dummyBookingId);
  }

  // Check communication_logs table
  const { data: commData, error: commErr } = await client
    .from("communication_logs")
    .select("*")
    .limit(1);

  if (commErr) {
    console.error("❌ Error checking communication_logs:", commErr);
  } else if (commData && commData.length > 0) {
    console.log("✅ 'communication_logs' table columns:", Object.keys(commData[0]));
  } else {
    console.log("✅ 'communication_logs' table exists (0 rows)");
  }
}

checkColumns().catch(console.error);
