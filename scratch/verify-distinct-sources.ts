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

  console.log("Querying distinct sources from leads table...");
  const { data: leads, error } = await admin.from("leads").select("source, email, created_at");
  if (error) {
    console.error("Error querying leads:", error);
    return;
  }

  const distinctSources = Array.from(new Set(leads.map(l => l.source)));
  console.log("DISTINCT SOURCES IN LEADS TABLE:", distinctSources);
  console.log("\nTotal Lead Count:", leads.length);
  console.log("Sample records per source:");
  for (const s of distinctSources) {
    const sample = leads.filter(l => l.source === s).slice(0, 2);
    console.log(`Source: '${s}' -> Count: ${leads.filter(l => l.source === s).length}`, sample);
  }
}

run().catch(err => console.error("Unhandled error:", err));
