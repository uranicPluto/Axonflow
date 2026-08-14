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

async function testMoreSources() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) return;

  const candidateSources = [
    "CALCOM",
    "Cal.com",
    "cal.com",
    "BOOKING",
    "FLOW_A",
    "flow_a",
    "WEBHOOK",
    "external",
    "book_a_call",
    "BOOK_A_CALL",
    "lead_form",
    "public_intake"
  ];

  console.log("==========================================");
  console.log("TESTING MORE WORKFLOW_EVENTS SOURCES");
  console.log("==========================================\n");

  for (const source of candidateSources) {
    const testId = `test-src-${source.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}`;
    const { data, error } = await client
      .from("workflow_events")
      .insert([{
        event_id: testId,
        source,
        event_type: "BOOKING_CREATED",
        payload: { test: true },
        status: "claimed",
        attempt_count: 1,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.log(`❌ source = '${source}': REJECTED -> ${error.message}`);
    } else {
      console.log(`✅ source = '${source}': ACCEPTED! ID: ${data[0].id}`);
      await client.from("workflow_events").delete().eq("id", data[0].id);
    }
  }
}

testMoreSources().catch(console.error);
