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

async function testClaimComm() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const { db } = await import("../src/server/db");

  const client = getSupabaseAdmin();
  if (!client) return;

  console.log("==========================================");
  console.log("TESTING CLAIM COMMUNICATION IN SUPABASE");
  console.log("==========================================\n");

  const key = `test-key-${Date.now()}`;
  try {
    const res = await db.claimCommunication(key, "lead-test-1", "whatsapp", "twilio", "test_tmpl", "alert");
    console.log("✓ claimCommunication result:", res);
  } catch (err: any) {
    console.error("❌ claimCommunication error:", err);
  }
}

testClaimComm().catch(console.error);
