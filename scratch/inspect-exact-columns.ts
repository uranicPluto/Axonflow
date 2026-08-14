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

async function inspectExactColumns() {
  const { getSupabaseAdmin } = await import("../src/server/supabase");
  const client = getSupabaseAdmin();
  if (!client) return;

  console.log("==========================================");
  console.log("INSPECTING EXACT TABLE SCHEMA IN SUPABASE");
  console.log("==========================================\n");

  // Fetch OpenAPI schema from Supabase PostgREST REST endpoint
  const url = `${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
  try {
    const res = await fetch(url);
    const spec = await res.json();
    console.log("Definitions in Supabase OpenAPI Schema:");
    if (spec.definitions) {
      for (const tableName of Object.keys(spec.definitions)) {
        const properties = spec.definitions[tableName].properties || {};
        console.log(`\nTable '${tableName}':`);
        console.log(`  Columns: ${Object.keys(properties).join(", ")}`);
      }
    } else {
      console.log("No definitions found in OpenAPI spec");
    }
  } catch (err) {
    console.error("Error fetching OpenAPI spec:", err);
  }
}

inspectExactColumns().catch(console.error);
