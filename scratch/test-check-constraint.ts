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

  console.log("--- TEST 1: Insert with source = 'book_a_call' ---");
  const { data: res1, error: err1 } = await admin.from("leads").insert([{
    name: "Check Test 1",
    email: `test.bookacall.${Date.now()}@example.com`,
    source: "book_a_call"
  }]).select().single();
  console.log("Result 1:", { success: !err1, error: err1?.message });

  console.log("\n--- TEST 2: Insert with source = 'experience_form' ---");
  const { data: res2, error: err2 } = await admin.from("leads").insert([{
    name: "Check Test 2",
    email: `test.expform.${Date.now()}@example.com`,
    source: "experience_form"
  }]).select().single();
  console.log("Result 2:", { success: !err2, error: err2?.message });

  console.log("\n--- TEST 3: Insert with source = 'experience_service' ---");
  const { data: res3, error: err3 } = await admin.from("leads").insert([{
    name: "Check Test 3",
    email: `test.expservice.${Date.now()}@example.com`,
    source: "experience_service"
  }]).select().single();
  console.log("Result 3:", { success: !err3, error: err3?.message, code: err3?.code, details: err3?.details });
}

run().catch(err => console.error("Unhandled error:", err));
