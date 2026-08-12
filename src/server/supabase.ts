import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Ensure this module is never bundled into client browser builds
if (typeof window !== "undefined") {
  throw new Error("CRITICAL SECURITY ERROR: Server-only Supabase module imported on client side!");
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

const isProduction = process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";

export let isSupabaseEnabled = SUPABASE_URL !== "" && (SUPABASE_SERVICE_ROLE_KEY !== "" || SUPABASE_ANON_KEY !== "");

// Privileged Service Role Supabase Client (Server-Side Only, uses ONLY SUPABASE_SERVICE_ROLE_KEY or recognized alias)
export let supabaseAdmin: SupabaseClient | null = (SUPABASE_URL !== "" && SUPABASE_SERVICE_ROLE_KEY !== "")
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Dynamic getter for supabaseAdmin that re-checks process.env at call time.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdmin;
}

// Public Anon Supabase Client (Used for public read operations subject to RLS)
export const supabaseAnon: SupabaseClient | null = (SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "")
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;
