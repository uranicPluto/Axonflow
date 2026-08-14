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

async function runSqlDirect() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const projectUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!serviceKey || !projectUrl) {
    console.error("Missing keys");
    return;
  }

  const sql = fs.readFileSync(
    path.resolve(process.cwd(), "supabase/migrations/20260814_ai_meeting_prep.sql"),
    "utf8"
  );

  // Extract reference ID from URL (e.g. https://xyz.supabase.co -> xyz)
  const match = projectUrl.match(/https?:\/\/([a-zA-Z0-9-]+)\.supabase/);
  const projectRef = match ? match[1] : null;
  console.log("Project Ref:", projectRef);

  // Try calling Supabase SQL Admin API if token/key is valid
  const res = await fetch(`${projectUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`
    },
    body: JSON.stringify({ query: sql })
  });

  const body = await res.text();
  console.log("RPC Response status:", res.status, body);
}

runSqlDirect().catch(console.error);
