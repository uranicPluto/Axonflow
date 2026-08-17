import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

import { getSupabaseAdmin } from "../src/server/supabase";

async function inspectLead() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.log("Supabase admin null");
    return;
  }

  const targetId = "4ce31e30-fa40-400e-bea9-7bf525729583";
  console.log("=== INSPECTING LEAD:", targetId, "===");

  const { data: lead, error } = await admin.from("leads").select("*").eq("id", targetId).single();
  if (error) {
    console.error("Error fetching lead:", error);
  } else {
    console.log("Lead Record:", JSON.stringify(lead, null, 2));
  }

  console.log("\n=== CHECKING ERROR LOGS ===");
  const { data: errorLogs } = await admin.from("error_logs").select("*").order("created_at", { ascending: false }).limit(10);
  console.log("Recent Error Logs:", JSON.stringify(errorLogs, null, 2));

  console.log("\n=== CHECKING WORKFLOW LOGS ===");
  const { data: wfLogs } = await admin.from("workflow_logs").select("*").order("timestamp", { ascending: false }).limit(10);
  console.log("Recent Workflow Logs:", JSON.stringify(wfLogs, null, 2));
}

inspectLead().catch(console.error);
