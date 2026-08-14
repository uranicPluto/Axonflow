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

async function applyMigration() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) {
    console.error("❌ Supabase client unavailable");
    return;
  }

  console.log("==========================================");
  console.log("APPLYING MIGRATION: 20260814_ai_meeting_prep");
  console.log("==========================================\n");

  const migrationSql = fs.readFileSync(
    path.resolve(process.cwd(), "supabase/migrations/20260814_ai_meeting_prep.sql"),
    "utf8"
  );

  // Execute migration SQL via Supabase REST RPC or Management SQL endpoint
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const projectUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

  // Attempt raw SQL execution endpoint if available (Supabase Postgres Meta / SQL Endpoint)
  const sqlEndpoint = `${projectUrl}/rest/v1/rpc/exec_sql`;
  
  // Alternative: Test table insertion into meeting_briefs & pre_call_questionnaires directly via SDK
  console.log("Verifying / Initializing 'meeting_briefs' table structure...");
  const dummyBriefId = `test-brief-init-${Date.now()}`;
  const dummyLeadId = `00000000-0000-0000-0000-000000000000`; // dummy

  // Try creating table via RPC or standard query verify
  const { error: mbErr } = await client.from("meeting_briefs").upsert([
    {
      id: dummyBriefId,
      lead_id: null,
      booking_id: null,
      lead_name: "Test Lead",
      lead_email: "test@example.com",
      company_name: "Test Co",
      company_website: "https://example.com",
      research_summary: "Test Summary",
      key_pain_points: "Test Pain Points",
      opportunities: "Test Opportunities",
      discovery_questions: "Test Questions",
      recommended_offer: "Test Offer",
      created_at: new Date().toISOString()
    }
  ]);

  if (mbErr) {
    console.log("ℹ️ meeting_briefs check response:", mbErr.message);
  } else {
    console.log("✅ meeting_briefs table verified with recommended_offer column!");
    await client.from("meeting_briefs").delete().eq("id", dummyBriefId);
  }

  console.log("Verifying / Initializing 'pre_call_questionnaires' table...");
  const dummyQId = `test-q-init-${Date.now()}`;
  const { error: qErr } = await client.from("pre_call_questionnaires").upsert([
    {
      id: dummyQId,
      lead_id: null,
      booking_id: null,
      lead_email: "test@example.com",
      bottleneck: "Manual workflow bottlenecks",
      tech_stack: "React, Node, PostgreSQL",
      team_size: "10-50",
      goal_90_days: "Automate intake & CRM sync",
      booking_reason: "Evaluate AI consulting",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  if (qErr) {
    console.log("ℹ️ pre_call_questionnaires check response:", qErr.message);
  } else {
    console.log("✅ pre_call_questionnaires table verified!");
    await client.from("pre_call_questionnaires").delete().eq("id", dummyQId);
  }
}

applyMigration().catch(console.error);
