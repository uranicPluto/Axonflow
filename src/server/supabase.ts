import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Ensure this module is never bundled into client browser builds
if (typeof window !== "undefined") {
  throw new Error("CRITICAL SECURITY ERROR: Server-only Supabase module imported on client side!");
}

export function isSupabaseActive(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return url !== "" && (serviceKey !== "" || anonKey !== "");
}

export let isSupabaseEnabled = isSupabaseActive();

// Privileged Service Role Supabase Client (Server-Side Only)
export let supabaseAdmin: SupabaseClient | null = null;

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
  isSupabaseEnabled = true;
  return supabaseAdmin;
}

// Initial client creation attempt
getSupabaseAdmin();

// Public Anon Supabase Client (Used for public read operations subject to RLS)
export const supabaseAnon: SupabaseClient | null = (() => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return (url !== "" && anonKey !== "")
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;
})();
