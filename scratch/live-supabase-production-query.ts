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

import { getSupabaseAdmin } from "../src/server/supabase";

async function queryLiveProductionSupabase() {
  console.log("==================================================");
  console.log("LIVE SUPABASE PRODUCTION QUERY AUDIT");
  console.log("Project: xnqtfbhuotrnsrramzxu");
  console.log("URL:", process.env.SUPABASE_URL);
  console.log("==================================================\n");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("❌ Failed to initialize Supabase admin client!");
    process.exit(1);
  }

  // Query 1: workflow_events
  console.log("1. SELECT * FROM workflow_events WHERE event_id LIKE '%23789137%';");
  const { data: wfRows, error: wfError } = await supabase
    .from("workflow_events")
    .select("*")
    .like("event_id", "%23789137%");

  if (wfError) {
    console.error("   Error:", wfError.message);
  } else {
    console.log("   Rows Found:", wfRows?.length || 0);
    console.log("   Data:", JSON.stringify(wfRows, null, 2));
  }

  // Query 2: leads
  console.log("\n2. SELECT * FROM leads WHERE email='jaymahajan987@gmail.com';");
  const { data: leadRows, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("email", "jaymahajan987@gmail.com");

  if (leadError) {
    console.error("   Error:", leadError.message);
  } else {
    console.log("   Rows Found:", leadRows?.length || 0);
    console.log("   Data:", JSON.stringify(leadRows, null, 2));
  }

  // Query 3: bookings
  console.log("\n3. SELECT * FROM bookings WHERE cal_booking_uid='23789137';");
  const { data: bookingRows, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("cal_booking_uid", "23789137");

  if (bookingError) {
    console.error("   Error:", bookingError.message);
  } else {
    console.log("   Rows Found:", bookingRows?.length || 0);
    console.log("   Data:", JSON.stringify(bookingRows, null, 2));
  }

  // Also query recent workflow events in general to inspect incoming production activity
  console.log("\n4. SELECT * FROM workflow_events ORDER BY created_at DESC LIMIT 5;");
  const { data: recentWf, error: recentWfErr } = await supabase
    .from("workflow_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentWfErr) {
    console.error("   Error:", recentWfErr.message);
  } else {
    console.log("   Recent Workflow Events Count:", recentWf?.length || 0);
    console.log("   Recent Workflow Events Data:", JSON.stringify(recentWf, null, 2));
  }
}

queryLiveProductionSupabase().catch(console.error);
