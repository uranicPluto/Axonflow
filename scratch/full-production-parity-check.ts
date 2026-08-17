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

  console.log("=== FULL PRODUCTION PARITY INSPECTION ===");

  const expectedTables = [
    "leads",
    "webhook_events",
    "call_logs",
    "meetings",
    "communication_logs",
    "manual_tasks",
    "error_logs",
    "rate_limit_log",
    "lead_activities",
    "workflow_logs",
    "posts",
    "faqs",
    "testimonials",
    "services",
    "team_members",
    "case_studies",
    "problem_statements",
    "hero_content",
    "footer_content"
  ];

  console.log("\n--- 1. Testing Table Existence in Live Supabase ---");
  const missingTables: string[] = [];
  const existingTables: string[] = [];

  for (const tbl of expectedTables) {
    const { error } = await admin.from(tbl).select("*").limit(1);
    if (error && (error.message.includes("does not exist") || error.code === "PGRST205" || error.code === "42P01")) {
      missingTables.push(tbl);
      console.log(`Table '${tbl}': MISSING (${error.message})`);
    } else {
      existingTables.push(tbl);
      console.log(`Table '${tbl}': PRESENT`);
    }
  }

  console.log("\n--- 2. Inspecting Columns in 'leads' Table ---");
  const { data: leadSample } = await admin.from("leads").select("*").limit(1).single();
  const liveLeadCols = new Set(Object.keys(leadSample || {}));

  console.log("Total Live Columns on 'leads':", liveLeadCols.size);

  const targetLeadsColumns: Record<string, string> = {
    // Core Intake & Attribution
    name: "TEXT NOT NULL",
    full_name: "TEXT",
    lead_uid: "TEXT UNIQUE",
    company: "TEXT",
    company_name: "TEXT",
    email: "TEXT NOT NULL",
    phone: "TEXT",
    service_interest: "TEXT",
    problem_description: "TEXT",
    source: "TEXT DEFAULT 'experience_service'",
    status: "TEXT DEFAULT 'new_lead'",
    qualification_status: "TEXT DEFAULT 'pending'",
    owner_id: "UUID",
    assigned_at: "TIMESTAMPTZ",
    outcome: "TEXT",
    outcome_at: "TIMESTAMPTZ",
    consent_given: "BOOLEAN DEFAULT false",
    consent_timestamp: "TIMESTAMPTZ",
    consent_ip: "TEXT",
    consent_user_agent: "TEXT",
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
    call_attempted_at: "TIMESTAMPTZ",
    call_answered: "BOOLEAN",
    call_attempts: "INTEGER DEFAULT 0",
    call_in_progress: "BOOLEAN DEFAULT false",
    call_outcome: "TEXT",
    call_summary: "TEXT",
    call_transcript: "TEXT",
    call_recording_url: "TEXT",
    call_duration_sec: "INTEGER",
    call_token: "TEXT UNIQUE",
    call_token_expires_at: "TIMESTAMPTZ",
    call_token_used: "BOOLEAN DEFAULT false",
    fit_score: "INTEGER",
    intent_score: "INTEGER",
    urgency_score: "INTEGER",
    budget_score: "INTEGER",
    lead_score: "INTEGER",
    lead_score_reason: "TEXT",
    lead_temperature: "TEXT DEFAULT 'warm'",
    budget_level: "TEXT",
    urgency: "TEXT",
    qualification: "TEXT",
    gpt_summary: "TEXT",
    recommended_service: "TEXT",
    talking_points: "JSONB DEFAULT '[]'::jsonb",
    pain_points: "TEXT",
    budget_signal: "TEXT",
    team_size: "TEXT",
    existing_solutions: "TEXT",
    temperature: "TEXT DEFAULT 'warm'",
    last_interaction_at: "TIMESTAMPTZ DEFAULT now()",
    meeting_booked: "BOOLEAN DEFAULT false",
    meeting_time: "TIMESTAMPTZ",
    meeting_datetime: "TIMESTAMPTZ",
    attendee_timezone: "TEXT",
    meeting_link: "TEXT",
    meeting_confirmed: "BOOLEAN DEFAULT false",
    cal_event_id: "TEXT",
    reminder_sent: "BOOLEAN DEFAULT false",
    internal_notes: "TEXT",
    callback_requested: "BOOLEAN DEFAULT false",
    callback_time: "TEXT"
  };

  const missingLeadsCols: string[] = [];
  for (const [col, def] of Object.entries(targetLeadsColumns)) {
    if (!liveLeadCols.has(col)) {
      missingLeadsCols.push(col);
    }
  }

  console.log(`\nMissing Columns on 'leads' table (${missingLeadsCols.length}):`);
  console.log(JSON.stringify(missingLeadsCols, null, 2));
}

run().catch(err => console.error("Unhandled error:", err));
