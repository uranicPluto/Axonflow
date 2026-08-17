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

  const testEmail = `test.exp.${Date.now()}@example.com`;
  console.log(`Executing exact script requested by user for email: ${testEmail}...`);

  const { data, error } = await admin.from("leads").insert([{
    name: "Test Experience",
    email: testEmail,
    source: "experience_service"
  }]).select().single();

  console.log("--- EXACT SUPABASE RESULT ---");
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

run().catch(err => console.error("Unhandled error:", err));
