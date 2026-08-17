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

import { triggerN8nExperienceServiceWebhook } from "../src/server/n8n-webhook";
import { getSupabaseAdmin } from "../src/server/supabase";

async function runLiveTest() {
  console.log("==================================================");
  console.log("TESTING LIVE N8N WEBHOOK DISPATCH");
  console.log("==================================================");

  const testPayload = {
    lead_id: `test-lead-${Date.now()}`,
    name: "Jayesh Mahajan (Forensic Test)",
    email: `n8n.test.${Date.now()}@houseofworkflow.com`,
    phone: "+91 98765 43210",
    service_interest: "ai_automation",
    problem_description: "Testing live n8n webhook integration for Experience Service Form intake.",
    source: "experience_service",
    created_at: new Date().toISOString(),
  };

  console.log("Dispatching Payload to n8n:", JSON.stringify(testPayload, null, 2));

  await triggerN8nExperienceServiceWebhook(testPayload);

  console.log("\nChecking database workflow_logs for n8n_webhook_trigger entry...");
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: logs } = await admin
      .from("workflow_logs")
      .select("*")
      .eq("workflow_name", "experience_service")
      .order("timestamp", { ascending: false })
      .limit(5);

    console.log("Supabase workflow_logs table records:", JSON.stringify(logs, null, 2));
  }

  console.log("==================================================");
  console.log("N8N WEBHOOK TEST COMPLETED");
  console.log("==================================================");
}

runLiveTest().catch(console.error);
