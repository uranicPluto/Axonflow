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

  console.log("--- Inspecting Live Supabase 'leads' Table Schema ---");
  
  // Method 1: Fetch 1 record to get raw column keys
  const { data: sampleRecord, error: sampleErr } = await admin.from("leads").select("*").limit(1).single();
  if (sampleErr) {
    console.error("Sample fetch error:", sampleErr);
  } else {
    const liveColumns = Object.keys(sampleRecord || {}).sort();
    console.log("\nLive Database Columns Count:", liveColumns.length);
    console.log("Live Database Columns List:");
    console.log(JSON.stringify(liveColumns, null, 2));
  }

  // Method 2: Test individual attribution columns to confirm presence/absence
  const attributionCols = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "landing_page",
    "referrer",
    "is_spam",
    "rate_limited",
    "call_opted_in",
    "call_scheduled_at",
    "call_attempts",
    "fit_score",
    "intent_score",
    "urgency_score",
    "budget_score",
    "gpt_summary",
    "talking_points",
    "last_interaction_at",
    "cal_event_id"
  ];

  console.log("\n--- Testing Specific Column Existence in Production ---");
  for (const col of attributionCols) {
    const { error } = await admin.from("leads").select(col).limit(1);
    if (error) {
      console.log(`Column '${col}': MISSING (Error: ${error.message})`);
    } else {
      console.log(`Column '${col}': PRESENT`);
    }
  }
}

run().catch(err => console.error("Unhandled error:", err));
