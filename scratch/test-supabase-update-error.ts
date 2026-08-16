import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse .env file manually
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

import { getSupabaseAdmin, isSupabaseActive } from "../src/server/supabase";
import { db } from "../src/server/db";

async function run() {
  const admin = getSupabaseAdmin();
  console.log("isSupabaseActive:", isSupabaseActive());
  console.log("admin client created:", !!admin);
  
  if (!admin) {
    console.log("Supabase admin client null!");
    return;
  }

  // Fetch leads to test update
  const { data: leads, error: fetchErr } = await admin.from("leads").select("*").limit(5);
  console.log("Fetch leads result count:", leads?.length, "Error:", fetchErr);

  if (leads && leads.length > 0) {
    const targetLead = leads[0];
    console.log("\nTarget lead ID:", targetLead.id);
    console.log("Target lead keys:", Object.keys(targetLead));

    const testPayload = {
      name: "Jay Mahajan Diagnostic",
      email: targetLead.email,
      call_token: "test-token-123",
      call_token_expires_at: new Date().toISOString(),
      call_token_used: false,
      updated_at: new Date().toISOString(),
    };

    console.log("\n--- Executing Direct Supabase Update ---");
    const { data: updateData, error: updateErr } = await admin
      .from("leads")
      .update(testPayload)
      .eq("id", targetLead.id)
      .select()
      .single();

    console.log("Direct update error message:", updateErr?.message);
    console.log("Direct update error details:", updateErr?.details);
    console.log("Direct update error hint:", updateErr?.hint);
    console.log("Direct update error code:", updateErr?.code);

    console.log("\n--- Testing safeSupabaseUpdate in db.createLead ---");
    try {
      const res = await db.createLead({
        name: "Jay Mahajan Test",
        email: targetLead.email,
        phone: "+919876543210",
        service_interest: "ai_automation",
        problem_description: "Testing update flow",
      });
      console.log("db.createLead SUCCESS:", res);
    } catch (e: any) {
      console.error("db.createLead FAILURE:", e.message);
      console.error("Stack:", e.stack);
    }
  }
}

run().catch(err => console.error("Unhandled error:", err));
