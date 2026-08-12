/**
 * Centralized Activity Logging Service with Secret Sanitization
 * Records system, admin, user, and automation activities into database.
 */

import { isSupabaseEnabled, supabaseAdmin } from "./supabase";
import { sanitizeData } from "./sanitize";

export interface ActivityLogParams {
  leadId?: string;
  actorType: "system" | "admin" | "user" | "automation";
  actorId?: string;
  action: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

export async function logActivity(params: ActivityLogParams): Promise<boolean> {
  const sanitizedDetails = sanitizeData(params.details);

  const entry = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    lead_id: params.leadId || null,
    actor_type: params.actorType,
    actor_id: params.actorId || "system",
    action: params.action,
    details: typeof sanitizedDetails === "object" ? JSON.stringify(sanitizedDetails) : sanitizedDetails || "",
    ip_address: params.ipAddress || "",
    created_at: new Date().toISOString(),
  };

  try {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin.from("activity_logs").insert([entry]);
      if (error) {
        // Fallback to secondary table if main table has different name
        await supabaseAdmin.from("activity_log").insert([
          {
            id: entry.id,
            message: `[${entry.actor_type}] ${entry.action}: ${entry.details}`,
            timestamp: entry.created_at,
          },
        ]);
      }
    } else {
      if (!(globalThis as any).__activityLogStore) {
        (globalThis as any).__activityLogStore = [];
      }
      ((globalThis as any).__activityLogStore as Array<any>).unshift(entry);
    }
    return true;
  } catch (err) {
    console.error("Failed to write activity log:", err);
    return false;
  }
}
