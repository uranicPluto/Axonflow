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

async function testStatuses() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) return;

  const candidateStatuses = [
    "pending",
    "processing",
    "processed",
    "completed",
    "failed",
    "new",
    "received",
    "claimed",
    "in_progress",
    "success"
  ];

  console.log("==========================================");
  console.log("TESTING WORKFLOW_EVENTS STATUS CONSTRAINT");
  console.log("==========================================\n");

  for (const status of candidateStatuses) {
    const testId = `test-st-${status}-${Date.now()}`;
    const { data, error } = await client
      .from("workflow_events")
      .insert([{
        event_id: testId,
        source: "cal.com",
        event_type: "BOOKING_CREATED",
        payload: { test: true },
        status,
        attempt_count: 1,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.log(`❌ status = '${status}': REJECTED -> ${error.message}`);
    } else {
      console.log(`✅ status = '${status}': ACCEPTED! ID: ${data[0].id}`);
      await client.from("workflow_events").delete().eq("id", data[0].id);
    }
  }
}

testStatuses().catch(console.error);
