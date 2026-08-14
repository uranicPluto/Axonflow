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

async function checkTables() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) {
    console.error("No client");
    return;
  }

  const candidateTables = [
    "leads",
    "webhook_events",
    "meetings",
    "bookings",
    "activity_logs",
    "lead_activity",
    "lead_activities",
    "communication_logs",
    "communications",
    "system_logs"
  ];

  console.log("==========================================");
  console.log("CHECKING SUPABASE TABLES IN PRODUCTION DB");
  console.log("==========================================\n");

  for (const table of candidateTables) {
    const { data, error } = await client.from(table).select("*").limit(1);
    if (error) {
      console.log(`❌ Table '${table}': NOT FOUND / ERROR -> ${error.code}: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': EXISTS! Found ${data.length} row(s)`);
      if (data.length > 0) {
        console.log(`   Sample columns: ${Object.keys(data[0]).join(", ")}`);
      }
    }
  }
}

checkTables().catch(console.error);
