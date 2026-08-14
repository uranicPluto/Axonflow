import fs from "node:fs";
import path from "node:path";

// Load .env manually if exists
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

import { getSupabaseAdmin, isSupabaseEnabled } from "../src/server/supabase";

async function main() {
  console.log("=== SUPABASE CONNECTIVITY & SCHEMA AUDIT ===");
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  console.log("SUPABASE URL present:", !!url, url);
  console.log("SUPABASE_SERVICE_ROLE_KEY present:", !!key);
  console.log("Is Supabase enabled:", isSupabaseEnabled);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("❌ ERROR: Supabase admin client is NULL!");
    process.exit(1);
  }

  console.log("\nChecking connectivity & tables in Supabase...");

  // 1. leads
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .limit(1);

  console.log("1. LEADS table:", {
    connected: !leadsError,
    error: leadsError?.message,
    rowCount: leads?.length,
  });

  // 2. bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .limit(1);

  console.log("2. BOOKINGS table:", {
    connected: !bookingsError,
    error: bookingsError?.message,
    rowCount: bookings?.length,
  });

  // 3. workflow_events
  const { data: workflowEvents, error: wfError } = await supabase
    .from("workflow_events")
    .select("*")
    .limit(1);

  console.log("3. WORKFLOW_EVENTS table:", {
    connected: !wfError,
    error: wfError?.message,
    rowCount: workflowEvents?.length,
  });

  // 4. communication_logs
  const { data: commLogs, error: commError } = await supabase
    .from("communication_logs")
    .select("*")
    .limit(1);

  console.log("4. COMMUNICATION_LOGS table:", {
    connected: !commError,
    error: commError?.message,
    rowCount: commLogs?.length,
  });
}

main().catch(console.error);
