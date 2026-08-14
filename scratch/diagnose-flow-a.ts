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

async function diagnoseFlowA() {
  console.log("==========================================");
  console.log("DIAGNOSING FLOW A - CAL.COM PERSISTENCE");
  console.log("==========================================\n");

  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const { db } = await import("../src/server/db");

  const client = getSupabaseAdmin();
  console.log(`supabaseAdmin present: ${!!client}`);

  if (!client) {
    console.error("❌ supabaseAdmin is null.");
    return;
  }

  // 1. Inspect recent webhook_events rows
  console.log("\n--- 1. Inspecting Recent Webhook Events in Supabase ---");
  const { data: webhooks, error: whErr } = await client
    .from("webhook_events")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(10);

  if (whErr) {
    console.error("❌ Error fetching webhook_events:", whErr);
  } else {
    console.log(`Found ${webhooks?.length || 0} recent webhook_events:`);
    console.log(JSON.stringify(webhooks, null, 2));
  }

  // 2. Inspect recent leads rows
  console.log("\n--- 2. Inspecting Recent Leads in Supabase ---");
  const { data: leads, error: leadErr } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (leadErr) {
    console.error("❌ Error fetching leads:", leadErr);
  } else {
    console.log(`Found ${leads?.length || 0} recent leads:`);
    console.log(JSON.stringify(leads, null, 2));
  }

  // 3. Inspect recent meetings rows
  console.log("\n--- 3. Inspecting Recent Meetings in Supabase ---");
  const { data: meetings, error: mtgErr } = await client
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (mtgErr) {
    console.error("❌ Error fetching meetings:", mtgErr);
  } else {
    console.log(`Found ${meetings?.length || 0} recent meetings:`);
    console.log(JSON.stringify(meetings, null, 2));
  }

  // 4. Test Lead Insert & Meeting Upsert with real fields
  console.log("\n--- 4. Testing processCalcomBooking with sample payload ---");
  const testPayload = {
    eventTrigger: "BOOKING_CREATED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: 987654321,
      id: 987654321,
      uid: `test-uid-diag-${Date.now()}`,
      title: "Flow A Diagnostic Call",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 1800000).toISOString(),
      meetingUrl: "https://cal.com/meeting/test-uid-diag",
      attendees: [
        {
          name: "Flow A Diagnostic Tester",
          email: `flowa-diag-${Date.now()}@example.com`,
          timeZone: "Asia/Kolkata",
          phoneNumber: "+919876543210"
        }
      ]
    }
  };

  try {
    const result = await db.processCalcomBooking(testPayload);
    console.log("✓ processCalcomBooking result:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error("❌ processCalcomBooking THREW ERROR:", err);
  }
}

diagnoseFlowA().catch(console.error);
