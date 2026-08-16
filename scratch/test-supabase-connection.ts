import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        if (key && !(key in process.env)) {
          process.env[key.trim()] = vals.join("=").trim();
        }
      }
    }
  }
}

loadEnvFile();

async function checkSupabaseConnection() {
  console.log("=== SUPABASE CONNECTION DIAGNOSTIC ===\n");

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  console.log(`URL: ${url ? url : "❌ MISSING"}`);
  console.log(`Service Role Key: ${serviceKey ? serviceKey.substring(0, 15) + "..." : "❌ MISSING"}`);
  console.log(`Anon Key: ${anonKey ? anonKey.substring(0, 15) + "..." : "❌ MISSING"}`);

  if (!url || (!serviceKey && !anonKey)) {
    console.error("\n❌ Supabase environment variables are missing.");
    process.exit(1);
  }

  const clientKey = serviceKey || anonKey;
  const client = createClient(url, clientKey, {
    auth: { persistSession: false },
  });

  try {
    const { data, error, count } = await client.from("leads").select("*", { count: "exact" }).limit(1);
    if (error) {
      console.error("\n❌ Supabase query failed:", error.message);
      process.exit(1);
    }
    console.log(`\n✅ Connected to Supabase successfully! (Leads table accessible, total rows: ${count ?? 0})`);
  } catch (err: any) {
    console.error("\n❌ Supabase connection error:", err?.message || err);
    process.exit(1);
  }
}

checkSupabaseConnection();
