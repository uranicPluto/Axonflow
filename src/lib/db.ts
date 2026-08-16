import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const PublicLeadIntakeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().default(""),
  service_interest: z.string().optional().default("not_sure"),
  problem_description: z.string().optional().default(""),
  consent: z.any().optional().default(true),
  turnstile_token: z.string().optional(),
});

// Re-export type definitions for client use
export type LeadStatus =
  | "new"
  | "contacted"
  | "call_opted_in"
  | "call_attempted"
  | "link_sent"
  | "meeting_booked"
  | "discovery_completed"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "archived";

export interface Lead {
  id: string;
  created_at: string;
  source: string;
  name: string;
  email: string;
  phone?: string;
  service_interest?: string;
  problem_description?: string;
  status: LeadStatus | string;
  consent_given?: boolean;
  consent_timestamp?: string;
  consent_ip?: string;
  consent_user_agent?: string;
  internal_notes?: string;
  lead_score?: number;
  lead_score_reason?: string;
  pain_points?: string;
  budget_signal?: string;
  business_type?: string;
  call_attempted_at?: string;
  call_answered?: boolean;
  call_transcript?: string;
  call_attempts: number;
  call_outcome?: string;
  meeting_datetime?: string;
  meeting_link?: string;
  meeting_confirmed: boolean;
  calendly_event_id?: string;
  call_opted_in?: boolean;
  call_token?: string;
  call_token_expires_at?: string;
  call_token_used?: boolean;
  updated_at: string;
}

export interface MeetingBrief {
  id: string;
  lead_id: string;
  booking_id?: string;
  lead_name: string;
  lead_email: string;
  company_name?: string;
  company_website?: string;
  research_summary: string;
  key_pain_points: string;
  opportunities: string;
  discovery_questions: string;
  recommended_offer: string;
  created_at: string;
}

export interface PreCallQuestionnaire {
  id: string;
  lead_id: string;
  booking_id?: string;
  lead_email: string;
  bottleneck: string;
  tech_stack: string;
  team_size: string;
  goal_90_days: string;
  booking_reason: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  read_time: string;
  author: string;
  excerpt: string;
  body: string; // JSON string
  status: string;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  industry_tag: string;
  service_tag: string;
  context_body: string;
  result_1_value: string;
  result_1_label: string;
  result_2_value: string;
  result_2_label: string;
  image_url?: string;
  image_alt?: string;
  sort_order: number;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerRole {
  id: string;
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  salary_range: string;
  summary: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  open: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author_name?: string;
  author_title?: string;
  author_company?: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  tagline?: string;
  description?: string;
  featured: boolean;
  stat_1_val?: string;
  stat_1_lbl?: string;
  stat_2_val?: string;
  stat_2_lbl?: string;
  stat_3_val?: string;
  stat_3_lbl?: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Client-safe cookie helpers
export const cookieHelper = {
  get(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },
  set(name: string, value: string, hoursActive: number) {
    if (typeof document === "undefined") return;
    const d = new Date();
    d.setTime(d.getTime() + hoursActive * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  },
  delete(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

// Helper function to verify admin authentication & CSRF on server functions
async function verifyAdminAuth(requireCsrf: boolean = false): Promise<void> {
  try {
    const { getWebRequest } = await import("@tanstack/react-start/server");
    const request = getWebRequest();
    if (!request) {
      // Allow bypass ONLY in explicit unit test runner environment
      if (process.env.NODE_ENV === "test") {
        return;
      }
      throw new Error("Unauthorized: HTTP request context required");
    }

    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, v.join("=")];
      })
    );

    const sessionToken = cookies.how_admin_session;
    const { db } = await import("../server/db");
    const isAuth = await db.checkAdminAuth(sessionToken || null);
    if (!isAuth) {
      throw new Error("Unauthorized: Invalid or missing admin session");
    }

    if (requireCsrf) {
      const { verifyCsrfTokenValues } = await import("../server/csrf");
      const cookieToken = cookies.how_csrf_token;
      const headerToken = request.headers.get("x-csrf-token") || request.headers.get("X-CSRF-Token");
      const csrfRes = verifyCsrfTokenValues(cookieToken, headerToken);
      if (!csrfRes.valid) {
        throw new Error(`CSRF Protection Error: ${csrfRes.reason}`);
      }
    }
  } catch (err: any) {
    if (err.message?.startsWith("Unauthorized") || err.message?.startsWith("CSRF Protection Error")) {
      throw err;
    }
    throw new Error("Unauthorized: Admin authentication failed");
  }
}

// --- Server Functions ---
export const authenticateAdminFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.authenticateAdmin(data.email, data.password);
  });

export const checkAdminAuthFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getWebRequest } = await import("@tanstack/react-start/server");
      const request = getWebRequest();
      if (!request) return null;
      const cookieHeader = request.headers.get("Cookie") || "";
      const match = cookieHeader.match(/how_admin_session=([^;]+)/);
      return match ? match[1] : null;
    } catch (err) {
      console.warn("Failed to get request headers or cookies inside server function (this is expected during SSR):", err);
      return null;
    }
  });

export const getAdminSessionCookieFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getWebRequest } = await import("@tanstack/react-start/server");
      const request = getWebRequest();
      if (!request) return null;
      const cookieHeader = request.headers.get("Cookie") || "";
      const match = cookieHeader.match(/how_admin_session=([^;]+)/);
      return match ? match[1] : null;
    } catch (err) {
      console.warn("Failed to get request headers or cookies inside server function (this is expected during SSR):", err);
      return null;
    }
  });

// Leads
export const getLeadsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();
  const { db } = await import("../server/db");
  return db.getLeads();
});

export const getLeadFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLead(data);
  });

export const createLeadFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    // Strictly validate against PublicLeadIntakeSchema
    const parsed = PublicLeadIntakeSchema.safeParse(d);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      throw new Error(`Validation failed: ${errorMsg}`);
    }
    // Return sanitized intake fields only
    return {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service_interest: parsed.data.service_interest,
      problem_description: parsed.data.problem_description,
      consent_given: parsed.data.consent,
      turnstile_token: parsed.data.turnstile_token,
    };
  })
  .handler(async ({ data }) => {
    let clientIp = "";
    let userAgent = "";
    try {
      const { getWebRequest } = await import("@tanstack/react-start/server");
      const req = getWebRequest();
      if (req) {
        clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";
        userAgent = req.headers.get("user-agent") || "";
      }
    } catch {
      // Ignored in non-http test runs
    }

    // 1. Cloudflare Turnstile Verification
    const { verifyTurnstileToken } = await import("../server/turnstile");
    const turnstileRes = await verifyTurnstileToken(data.turnstile_token, clientIp);
    if (!turnstileRes.success) {
      const { logError } = await import("../server/error-logger");
      await logError({
        severity: "warning",
        component: "createLeadFn:turnstile",
        errorMessage: "Turnstile security verification failed",
        context: { errors: turnstileRes.errorCodes, email: data.email, ip: clientIp },
      });
      throw new Error("Validation failed: Turnstile security verification failed");
    }

    // 2. Rate Limit Check (IP: 5/hr, Email: 3/24h, Phone: 3/24h)
    const { checkRateLimit } = await import("../server/rate-limit");
    const rateLimitRes = await checkRateLimit({
      ip: clientIp,
      email: data.email,
      phone: data.phone,
      action: "create_lead",
    });
    if (!rateLimitRes.allowed) {
      const { logError } = await import("../server/error-logger");
      await logError({
        severity: "warning",
        component: "createLeadFn:rate_limit",
        errorMessage: rateLimitRes.reason || "Rate limit exceeded",
        context: { email: data.email, phone: data.phone, ip: clientIp },
      });
      throw new Error(`Rate limit exceeded: ${rateLimitRes.reason}`);
    }

    console.log("[CREATE_LEAD_FN RECEIVED INTAKE DATA]", JSON.stringify(data, null, 2));
    const { db } = await import("../server/db");
    const leadPayload = {
      name: data.name,
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      service_interest: data.service_interest,
      problem_description: data.problem_description,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_ip: clientIp,
      consent_user_agent: userAgent,
      // Server forces source, status, qualification_status, meeting_booked for Workflow B
      source: "experience_service",
      status: "new_lead",
      qualification_status: "pending",
      meeting_booked: false,
    };
    console.log("[CREATE_LEAD_FN CALLING DB.CREATE_LEAD WITH PAYLOAD]", JSON.stringify(leadPayload, null, 2));
    const lead = await db.createLead(leadPayload);
    console.log("[CREATE_LEAD_FN DB.CREATE_LEAD RETURNED LEAD]", lead);

    // 3. Log Activity
    const { logActivity } = await import("../server/activity-logger");
    await logActivity({
      leadId: lead.id,
      actorType: "user",
      action: "lead_created",
      ipAddress: clientIp,
      details: { name: lead.name, email: lead.email, service_interest: lead.service_interest },
    });

    // 4. Auto-trigger Workflow B Experience Service Flow
    try {
      const { processExperienceFormSubmission } = await import("../server/experience-flow-engine");
      processExperienceFormSubmission({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service_interest: lead.service_interest,
        problem_description: lead.problem_description,
      }).catch((expErr) => console.error("[WORKFLOW B] Background experience flow error:", expErr));
    } catch (expErr) {
      console.error("[WORKFLOW B] Failed to initialize experience flow:", expErr);
    }

    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      call_token: lead.call_token,
      call_token_expires_at: lead.call_token_expires_at,
    };
  });

export const requestLeadCallFn = createServerFn({ method: "POST" })
  .validator((d: { leadId: string; callToken: string }) => {
    if (!d.leadId || typeof d.leadId !== "string") {
      throw new Error("leadId is required");
    }
    if (!d.callToken || typeof d.callToken !== "string") {
      throw new Error("callToken is required");
    }
    return d;
  })
  .handler(async ({ data }) => {
    let clientIp = "";
    try {
      const { getWebRequest } = await import("@tanstack/react-start/server");
      const req = getWebRequest();
      if (req) {
        clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";
      }
    } catch {
      // Ignored in non-http test runs
    }

    // Rate Limit Check for Call Requests
    const { checkRateLimit } = await import("../server/rate-limit");
    const rateLimitRes = await checkRateLimit({
      ip: clientIp,
      action: "request_call",
    });
    if (!rateLimitRes.allowed) {
      const { logError } = await import("../server/error-logger");
      await logError({
        severity: "warning",
        component: "requestLeadCallFn:rate_limit",
        errorMessage: rateLimitRes.reason || "Rate limit exceeded",
        context: { leadId: data.leadId, ip: clientIp },
      });
      throw new Error(`Rate limit exceeded: ${rateLimitRes.reason}`);
    }

    const { db } = await import("../server/db");
    const result = await db.requestLeadCallWithToken(data.leadId, data.callToken);

    const { logActivity } = await import("../server/activity-logger");
    await logActivity({
      leadId: data.leadId,
      actorType: "user",
      action: "call_requested",
      ipAddress: clientIp,
      details: "Call requested with single-use token",
    });

    return result;
  });

export const updateLeadStatusFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.updateLeadStatus(data.id, data.status);
  });

export const updateLeadNotesFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; notes: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.updateLeadNotes(data.id, data.notes);
  });

export const deleteLeadFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deleteLead(data);
  });

// Blog Posts
export const getPostsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getPosts();
});

export const getPostFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.getPost(data);
  });

export const savePostFn = createServerFn({ method: "POST" })
  .validator((d: Partial<BlogPost>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.savePost(data);
  });

export const deletePostFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deletePost(data);
  });

// Projects / Portfolio
export const getProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getProjects();
});

export const getProjectFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.getProject(data);
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((d: Partial<Project>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveProject(data);
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deleteProject(data);
  });

// Roles / Careers
export const getRolesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getRoles();
});

export const getRoleFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.getRole(data);
  });

export const saveRoleFn = createServerFn({ method: "POST" })
  .validator((d: Partial<CareerRole>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveRole(data);
  });

export const deleteRoleFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deleteRole(data);
  });

// Site Content CMS
export const getSiteContentFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getSiteContent();
});

export const getSiteContentMetaFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();
  const { db } = await import("../server/db");
  return db.getSiteContentMeta();
});

export const saveSiteContentFn = createServerFn({ method: "POST" })
  .validator((d: { key: string; value: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveSiteContent(data.key, data.value);
  });

// FAQs
export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getFaqs();
});

export const saveFaqFn = createServerFn({ method: "POST" })
  .validator((d: Partial<FaqItem>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveFaq(data);
  });

export const deleteFaqFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deleteFaq(data);
  });

// Testimonials
export const getTestimonialsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getTestimonials();
});

export const saveTestimonialFn = createServerFn({ method: "POST" })
  .validator((d: Partial<Testimonial>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveTestimonial(data);
  });

export const deleteTestimonialFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deleteTestimonial(data);
  });

// Services
export const getServicesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getServices();
});

export const saveServiceFn = createServerFn({ method: "POST" })
  .validator((d: Partial<ServiceItem>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveService(data);
  });

export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.deleteService(data);
  });

// Settings & Preferences
export const getSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();
  const { db } = await import("../server/db");
  return db.getSettings();
});

export const saveSettingsFn = createServerFn({ method: "POST" })
  .validator((d: { email?: string; password?: string; notification_email?: string; whatsapp_number?: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveSettings(data);
  });

export const saveIntegrationTogglesFn = createServerFn({ method: "POST" })
  .validator((d: Record<string, boolean>) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.saveIntegrationToggles(data);
  });

export const getRecentActivityFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();
  const { db } = await import("../server/db");
  return db.getRecentActivity();
});

export const addActivityLogFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.addActivityLog(data);
  });

export const getHealthFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getHealthStatus } = await import("../server/monitoring");
  return getHealthStatus();
});

export const getMetricsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();
  const { getSystemMetrics } = await import("../server/monitoring");
  return getSystemMetrics();
});

export const issueCsrfTokenFn = createServerFn({ method: "POST" }).handler(async () => {
  const { issueCsrfToken } = await import("../server/csrf");
  return issueCsrfToken();
});

export const getLeadTimelineFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLeadActivities(data);
  });

export const updateLeadQualificationFn = createServerFn({ method: "POST" })
  .validator((d: { leadId: string; qualificationData: { status?: string; lead_score?: number; budget_signal?: string; internal_notes?: string } }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.updateLeadQualification(data.leadId, data.qualificationData, "admin_operator");
  });

export const addLeadNoteFn = createServerFn({ method: "POST" })
  .validator((d: { leadId: string; note: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    await db.updateLeadNotes(data.leadId, data.note);
    return db.addLeadActivity(data.leadId, "note_added", `Added internal note: "${data.note}"`, "admin_operator");
  });

export const getDashboardMetricsFn = createServerFn({ method: "GET" })
  .validator((d: { startDate?: string; endDate?: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getDashboardMetrics(data.startDate, data.endDate);
  });

export const getLeadFunnelFn = createServerFn({ method: "GET" })
  .validator((d: { startDate?: string; endDate?: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLeadFunnel(data.startDate, data.endDate);
  });

export const getRevenueForecastFn = createServerFn({ method: "GET" })
  .validator((d: { startDate?: string; endDate?: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getRevenueForecast(data.startDate, data.endDate);
  });

export const getLeadSourceMetricsFn = createServerFn({ method: "GET" })
  .validator((d: { startDate?: string; endDate?: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLeadSourceMetrics(data.startDate, data.endDate);
  });

export const getLeadTrendMetricsFn = createServerFn({ method: "GET" })
  .validator((d: { startDate?: string; endDate?: string }) => d)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLeadTrendMetrics(data.startDate, data.endDate);
  });

export const getDashboardAlertsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getDashboardAlerts();
  });

export const runDailyCronJobsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.runDailyCronJobs();
  });

export const getCommunicationLogsByLeadFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getCommunicationLogsByLead(data);
  });

export const processCalcomBookingFn = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data }) => {
    await verifyAdminAuth(true);
    const { db } = await import("../server/db");
    return db.processCalcomBooking(data);
  });

export const getMeetingBriefFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getBriefForLead(data);
  });

export const getQuestionnaireFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getQuestionnaireForLead(data);
  });

export const getLeadEnrichmentFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getEnrichmentForLead(data);
  });

export const getCompanyResearchFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getCompanyResearchForLead(data);
  });

export const getMeetingOutcomesFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getMeetingOutcomesForLead(data);
  });

export const getProposalRecommendationFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getProposalForLead(data);
  });

export const getLeadScoreFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLeadScoreForLead(data);
  });

export const getFounderCommandCenterFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getFounderCommandCenterData();
  });

export const getMeetingIntelligenceFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLatestMeetingIntelligenceForLead(data);
  });

export const getMeetingTranscriptsFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getMeetingTranscriptsForLead(data);
  });

export const getRevenueCopilotFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runRevenueAgent } = await import("../server/revenue-agent");
    return runRevenueAgent();
  });

export const getRevenueWarRoomFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { calculateRevenueForecast } = await import("../server/revenue-forecast-engine");
    const leads = await db.getLeads();
    const forecast = calculateRevenueForecast({ leads });
    const hotOpportunities = leads.filter((l) => (l.lead_score || 0) >= 70 || (l.close_probability || 0) >= 70);
    const dealsAtRisk = leads.filter((l) => l.status === "proposal_sent" || (l.close_probability !== undefined && l.close_probability < 40));
    return { hotOpportunities, dealsAtRisk, forecast };
  });

export const getBuyingIntentFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { calculateBuyingIntent } = await import("../server/buying-intent-engine");
    const { db } = await import("../server/db");
    const lead = await db.getLeadById(data);
    const intel = await db.getLatestMeetingIntelligenceForLead(data);
    const eng = await db.getProposalEngagement(data, data);
    return calculateBuyingIntent({
      budgetDiscussed: !!lead?.budget_signal,
      proposalRequested: lead?.status === "proposal_sent" || lead?.status === "discovery_completed",
      meetingIntelligence: intel,
      proposalEngagement: eng
    });
  });

export const getDealHealthFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { calculateDealHealth } = await import("../server/deal-health-engine");
    const { db } = await import("../server/db");
    const lead = await db.getLeadById(data);
    return calculateDealHealth({
      daysSinceActivity: 2,
      proposalEngagementScore: 75,
      intentScore: lead?.lead_score || 80,
      meetingSentiment: "positive",
      closeProbability: lead?.close_probability || 85
    });
  });

export const runDealExecutionAgentFn = createServerFn({ method: "POST" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { runDealExecutionAgent } = await import("../server/deal-execution-agent");
    const lead = await db.getLeadById(data);
    if (!lead) throw new Error("Lead not found");
    const intel = await db.getLatestMeetingIntelligenceForLead(data);
    return runDealExecutionAgent({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      status: lead.status,
      leadScore: lead.lead_score,
      closeProbability: lead.close_probability,
      meetingIntelligence: intel
    });
  });

export const getDealRoomIntelligenceFn = createServerFn({ method: "GET" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { handleGetDealRoomRequest } = await import("../server/api/deal-execution-api");
    const res = await handleGetDealRoomRequest(data);
    return res.json();
  });

export const runAccountExecutiveFn = createServerFn({ method: "POST" })
  .validator((leadId: string) => leadId)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { handleRunAccountExecutiveRequest } = await import("../server/api/account-executive-api");
    const req = new Request("http://localhost/api/admin/account-executive/run", {
      method: "POST",
      body: JSON.stringify({ leadId: data })
    });
    const res = await handleRunAccountExecutiveRequest(req);
    return res.json();
  });

export const getPendingActionsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { getPendingQueueActions } = await import("../server/execution-queue");
    return getPendingQueueActions();
  });

export const processApprovalFn = createServerFn({ method: "POST" })
  .validator((data: { actionId: string; decision: "approved" | "rejected" | "edited"; payload?: any }) => data)
  .handler(async ({ data }) => {
    await verifyAdminAuth();
    const { processActionApproval } = await import("../server/execution-queue");
    return processActionApproval(data.actionId, data.decision, "Founder", data.payload);
  });

export const generatePipelineFn = createServerFn({ method: "POST" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runPipelineGenerationAgent } = await import("../server/pipeline-generation-agent");
    return runPipelineGenerationAgent();
  });

export const getProspectsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getProspectAccounts();
  });

export const getIntentSignalsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getLatestIntentSignals();
  });

export const getPipelineAgentFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runPipelineAgent } = await import("../server/pipeline-agent");
    return runPipelineAgent();
  });

export const getAccountPrioritiesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getAccountPriorities();
  });

export const getReactivationOpportunitiesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getReactivationOpportunities();
  });

export const getRevenueOperationsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runRevenueOperationsAgent } = await import("../server/revenue-operations-agent");
    return runRevenueOperationsAgent();
  });

export const getExecutiveScorecardFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { generateExecutiveScorecard } = await import("../server/executive-scorecard");
    const leads = await db.getLeads();
    return generateExecutiveScorecard(leads);
  });

export const getBoardReportFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { generateBoardReport } = await import("../server/board-report-engine");
    const leads = await db.getLeads();
    return generateBoardReport(leads);
  });

export const getRevenueTargetsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { calculateRevenueTargets } = await import("../server/revenue-target-engine");
    const leads = await db.getLeads();
    return calculateRevenueTargets(leads);
  });

export const getGrowthAgentFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runGrowthAgent } = await import("../server/growth-agent");
    return runGrowthAgent();
  });

export const getMarketIntelligenceFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { generateMarketIntelligenceReport } = await import("../server/market-intelligence-engine");
    return generateMarketIntelligenceReport({ industry: "Software & SaaS" });
  });

export const getCompetitorIntelligenceFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    return db.getCompetitorIntelligence();
  });

export const getExpansionOpportunitiesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { generateExpansionOpportunities } = await import("../server/service-expansion-engine");
    return generateExpansionOpportunities();
  });

export const getStrategicAlertsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { detectStrategicAlerts } = await import("../server/strategic-alert-engine");
    const leads = await db.getLeads();
    return detectStrategicAlerts(leads);
  });

export const getFinanceAgentFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runFinanceAgent } = await import("../server/finance-agent");
    return runFinanceAgent();
  });

export const getClientProfitabilityFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { evaluateClientProfitability } = await import("../server/client-profitability-engine");
    const leads = await db.getLeads();
    return leads.length > 0
      ? leads.slice(0, 5).map((l) => evaluateClientProfitability({ leadId: l.id, clientName: l.company_name || l.name || "Client", revenue: l.value || 15000 }))
      : [evaluateClientProfitability({ clientName: "Acme Corp", revenue: 25000 })];
  });

export const getServiceProfitabilityFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { evaluateServiceProfitability } = await import("../server/service-profitability-engine");
    return evaluateServiceProfitability();
  });

export const getCashflowForecastFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { generateCashflowForecast } = await import("../server/cashflow-forecast-engine");
    return generateCashflowForecast();
  });

export const getFinancialAlertsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { detectFinancialAlerts } = await import("../server/financial-alert-engine");
    const leads = await db.getLeads();
    return detectFinancialAlerts(leads);
  });

export const getCustomerSuccessAgentFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runCustomerSuccessAgent } = await import("../server/customer-success-agent");
    return runCustomerSuccessAgent();
  });

export const getCustomerHealthFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { calculateCustomerHealth } = await import("../server/customer-health-engine");
    const leads = await db.getLeads();
    return leads.length > 0
      ? leads.slice(0, 5).map((l) => calculateCustomerHealth({ leadId: l.id, clientName: l.company_name || l.name || "Client Account" }))
      : [calculateCustomerHealth({ clientName: "Acme Corp SaaS" })];
  });

export const getRenewalForecastFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { predictRenewalForecast } = await import("../server/renewal-forecast-engine");
    const leads = await db.getLeads();
    return leads.length > 0
      ? leads.slice(0, 5).map((l) => predictRenewalForecast({ leadId: l.id, clientName: l.company_name || l.name || "Client Account", contractValue: l.value || 36000 }))
      : [predictRenewalForecast({ clientName: "Acme Corp SaaS" })];
  });

export const getCustomerExpansionOpportunitiesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { detectCustomerExpansionOpportunities } = await import("../server/expansion-opportunity-engine");
    const leads = await db.getLeads();
    return detectCustomerExpansionOpportunities(leads);
  });

export const getCustomerSentimentFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { analyzeCustomerSentiment } = await import("../server/customer-sentiment-engine");
    const leads = await db.getLeads();
    return leads.length > 0
      ? leads.slice(0, 5).map((l) => analyzeCustomerSentiment({ leadId: l.id, clientName: l.company_name || l.name || "Client Account" }))
      : [analyzeCustomerSentiment({ clientName: "Acme Corp SaaS" })];
  });

export const getDeliveryOperationsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runDeliveryOperationsAgent } = await import("../server/delivery-operations-agent");
    return runDeliveryOperationsAgent();
  });

export const getProjectHealthFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { db } = await import("../server/db");
    const { evaluateProjectExecution } = await import("../server/project-execution-engine");
    const leads = await db.getLeads();
    return leads.length > 0
      ? leads.slice(0, 5).map((l) => evaluateProjectExecution({ projectId: l.id, projectName: `${l.company_name || l.name || "Client"} Deployment`, clientName: l.company_name || l.name || "Client Account" }))
      : [evaluateProjectExecution({ projectName: "Acme SaaS Deployment", clientName: "Acme Corp" })];
  });

export const getTeamCapacityFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { calculateTeamCapacity } = await import("../server/team-capacity-engine");
    return calculateTeamCapacity();
  });

export const getResourceAllocationFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { generateResourceAllocationPlan } = await import("../server/resource-allocation-engine");
    return generateResourceAllocationPlan();
  });

export const getAIWorkforceFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { calculateAIWorkforceMetrics } = await import("../server/ai-workforce-engine");
    return calculateAIWorkforceMetrics();
  });

export const getCompanyHealthFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { calculateCompanyHealth } = await import("../server/company-health-engine");
    return calculateCompanyHealth();
  });

export const getExecutiveReportFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { runExecutiveAgent } = await import("../server/executive-agent");
    return runExecutiveAgent();
  });

export const getDecisionQueueFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { generateDecisionRecommendations } = await import("../server/decision-engine");
    return generateDecisionRecommendations();
  });

export const getCEOBriefFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { generateWeeklyCEOBrief } = await import("../server/ceo-briefing-engine");
    return generateWeeklyCEOBrief();
  });

export const getCompanyRoadmapFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await verifyAdminAuth();
    const { getStrategicRoadmap } = await import("../server/strategic-priority-engine");
    return getStrategicRoadmap();
  });


