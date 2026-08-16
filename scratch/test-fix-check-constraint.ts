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

import { getSupabaseAdmin } from "../src/server/supabase";

async function run() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.log("Supabase admin client null!");
    return;
  }

  console.log("Testing source = 'experience_form' insertion...");
  const { data: res1, error: err1 } = await admin.from("leads").insert([{
    name: "Constraint Test",
    email: `test.expform.${Date.now()}@example.com`,
    source: "experience_form"
  }]).select().single();
  console.log("Insert experience_form error:", err1?.message);

  console.log("Testing source = 'experience_service' insertion...");
  const { data: res2, error: err2 } = await admin.from("leads").insert([{
    name: "Constraint Test Service",
    email: `test.expservice.${Date.now()}@example.com`,
    source: "experience_service"
  }]).select().single();
  console.log("Insert experience_service error:", err2?.message);
}

run().catch(err => console.error("Unhandled error:", err));
