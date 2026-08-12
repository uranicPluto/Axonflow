import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Ensure this module is never bundled into client browser builds
if (typeof window !== "undefined") {
  throw new Error("CRITICAL SECURITY ERROR: Server-only Supabase module imported on client side!");
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isProduction = process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";

// In production mode, if service role key or URL are missing, supabaseAdmin remains null and isSupabaseEnabled is false.
// This allows health monitoring (getHealthStatus) to return HTTP 503 "unhealthy" gracefully instead of crashing module import.

export let isSupabaseEnabled = SUPABASE_URL !== "" && (SUPABASE_SERVICE_ROLE_KEY !== "" || SUPABASE_ANON_KEY !== "");

// Privileged Service Role Supabase Client (Server-Side Only, uses ONLY SUPABASE_SERVICE_ROLE_KEY)
export let supabaseAdmin: SupabaseClient | null = (SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "")
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Public Anon Supabase Client (Used for public read operations subject to RLS)
export const supabaseAnon: SupabaseClient | null = (SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "")
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;
