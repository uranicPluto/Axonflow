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
  if (!admin) return;

  const { data: sample } = await admin.from("leads").select("*").limit(1).single();
  const liveCols = new Set(Object.keys(sample || {}));

  // Target schema columns from supabase_schema.sql with their types
  const schemaCols: Record<string, string> = {
    company: "TEXT",
    qualification_status: "TEXT DEFAULT 'pending'",
    owner_id: "UUID",
    assigned_at: "TIMESTAMPTZ",
    outcome: "TEXT",
    outcome_at: "TIMESTAMPTZ",
    is_spam: "BOOLEAN DEFAULT false",
    rate_limited: "BOOLEAN DEFAULT false",
    utm_source: "TEXT",
    utm_medium: "TEXT",
    utm_campaign: "TEXT",
    utm_content: "TEXT",
    landing_page: "TEXT",
    referrer: "TEXT",
    call_opted_in: "BOOLEAN DEFAULT false",
    call_scheduled_at: "TIMESTAMPTZ",
    call_summary: "TEXT",
    fit_score: "INTEGER",
    intent_score: "INTEGER",
    urgency_score: "INTEGER",
    budget_score: "INTEGER",
    budget_level: "TEXT",
    qualification: "TEXT",
    gpt_summary: "TEXT",
    talking_points: "JSONB DEFAULT '[]'::jsonb",
    existing_solutions: "TEXT",
    temperature: "TEXT DEFAULT 'warm'",
    last_interaction_at: "TIMESTAMPTZ DEFAULT now()",
    attendee_timezone: "TEXT",
    cal_event_id: "TEXT",
  };

  const missing: string[] = [];
  const alterStatements: string[] = [];

  for (const [col, def] of Object.entries(schemaCols)) {
    if (!liveCols.has(col)) {
      missing.push(col);
      alterStatements.push(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ${col} ${def};`);
    }
  }

  console.log("=== MISSING COLUMNS IN PRODUCTION (" + missing.length + ") ===");
  console.log(JSON.stringify(missing, null, 2));

  console.log("\n=== EXACT ALTER TABLE STATEMENTS REQUIRED ===");
  console.log(alterStatements.join("\n"));
}

run().catch(err => console.error(err));
