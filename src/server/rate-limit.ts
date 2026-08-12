/**
 * Atomic Server-Side Rate Limiter Engine
 * Uses PostgreSQL stored procedure `check_rate_limit()` for zero-race-condition enforcement.
 * Enforces:
 * - IP: Max 5 requests / 1 hour (3600s)
 * - Email: Max 3 requests / 24 hours (86400s)
 * - Phone: Max 3 requests / 24 hours (86400s)
 */

import { isSupabaseEnabled, supabaseAdmin } from "./supabase";

export interface RateLimitCheckParams {
  ip?: string;
  phone?: string;
  email?: string;
  action: "create_lead" | "request_call";
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  resetSeconds?: number;
}

export async function checkRateLimit(params: RateLimitCheckParams): Promise<RateLimitResult> {
  const { ip, phone, email, action } = params;

  // 1. IP Check (Max 5 per 1 hr = 3600s)
  if (ip && ip !== "" && ip !== "127.0.0.1" && ip !== "::1") {
    const ipRes = await atomicCheck("ip", ip, action, 5, 3600);
    if (!ipRes.allowed) {
      return {
        allowed: false,
        reason: "Too many requests from your IP address. Please try again in an hour.",
        resetSeconds: ipRes.resetSeconds || 3600,
      };
    }
  }

  // 2. Email Check (Max 3 per 24 hrs = 86400s)
  if (email && email.trim() !== "") {
    const emailNorm = email.trim().toLowerCase();
    const emailRes = await atomicCheck("email", emailNorm, action, 3, 86400);
    if (!emailRes.allowed) {
      return {
        allowed: false,
        reason: "Maximum lead submissions reached for this email address today.",
        resetSeconds: emailRes.resetSeconds || 86400,
      };
    }
  }

  // 3. Phone Check (Max 3 per 24 hrs = 86400s)
  if (phone && phone.trim() !== "") {
    const phoneNorm = phone.replace(/\D/g, "");
    if (phoneNorm.length >= 7) {
      const phoneRes = await atomicCheck("phone", phoneNorm, action, 3, 86400);
      if (!phoneRes.allowed) {
        return {
          allowed: false,
          reason: "Maximum call/intake requests reached for this phone number today.",
          resetSeconds: phoneRes.resetSeconds || 86400,
        };
      }
    }
  }

  return { allowed: true };
}

async function atomicCheck(
  keyType: "ip" | "phone" | "email",
  keyValue: string,
  action: string,
  maxLimit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; resetSeconds?: number }> {
  if (isSupabaseEnabled && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
        p_key_type: keyType,
        p_key_value: keyValue,
        p_action: action,
        p_max_limit: maxLimit,
        p_window_seconds: windowSeconds,
      });

      if (!error && data) {
        return {
          allowed: !!data.allowed,
          resetSeconds: data.reset_seconds,
        };
      }
    } catch (err) {
      console.warn("Atomic RPC check_rate_limit warning:", err);
    }
  }

  // Fallback / Dev atomic in-memory bucket store
  if (!(globalThis as any).__atomicRateLimitStore) {
    (globalThis as any).__atomicRateLimitStore = new Map<string, { count: number; windowStart: number }>();
  }

  const store = (globalThis as any).__atomicRateLimitStore as Map<string, { count: number; windowStart: number }>;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const currentWindowStart = Math.floor(now / windowMs) * windowMs;
  const bucketKey = `${keyType}:${keyValue}:${action}:${currentWindowStart}`;

  const current = store.get(bucketKey);
  if (!current) {
    store.set(bucketKey, { count: 1, windowStart: currentWindowStart });
    return { allowed: true };
  } else {
    current.count += 1;
    const allowed = current.count <= maxLimit;
    const resetSeconds = Math.ceil((currentWindowStart + windowMs - now) / 1000);
    return { allowed, resetSeconds };
  }
}
