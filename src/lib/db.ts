import { createServerFn } from "@tanstack/react-start";

// Re-export type definitions for client use
export interface Lead {
  id: string;
  created_at: string;
  source: string;
  name: string;
  email: string;
  phone?: string;
  service_interest?: string;
  problem_description?: string;
  status: string;
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

// --- Server Functions ---
export const authenticateAdminFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.authenticateAdmin(data.email, data.password);
  });

export const checkAdminAuthFn = createServerFn({ method: "GET" })
  .validator((d: string | null) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.checkAdminAuth(data);
  });

export const getAdminSessionCookieFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getWebRequest } = await import("@tanstack/react-start/server");
    const request = getWebRequest();
    const cookieHeader = request?.headers.get("Cookie") || "";
    const match = cookieHeader.match(/how_admin_session=([^;]+)/);
    return match ? match[1] : null;
  });

// Leads
export const getLeadsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getLeads();
});

export const getLeadFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.getLead(data);
  });

export const createLeadFn = createServerFn({ method: "POST" })
  .validator((d: Partial<Lead>) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.createLead(data);
  });

export const updateLeadStatusFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.updateLeadStatus(data.id, data.status);
  });

export const updateLeadNotesFn = createServerFn({ method: "POST" })
  .validator((d: { id: string; notes: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.updateLeadNotes(data.id, data.notes);
  });

export const deleteLeadFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
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
    const { db } = await import("../server/db");
    return db.savePost(data);
  });

export const deletePostFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
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
    const { db } = await import("../server/db");
    return db.saveProject(data);
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
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
    const { db } = await import("../server/db");
    return db.saveRole(data);
  });

export const deleteRoleFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.deleteRole(data);
  });

// Site Content CMS
export const getSiteContentFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getSiteContent();
});

export const getSiteContentMetaFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getSiteContentMeta();
});

export const saveSiteContentFn = createServerFn({ method: "POST" })
  .validator((d: { key: string; value: string }) => d)
  .handler(async ({ data }) => {
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
    const { db } = await import("../server/db");
    return db.saveFaq(data);
  });

export const deleteFaqFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
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
    const { db } = await import("../server/db");
    return db.saveTestimonial(data);
  });

export const deleteTestimonialFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
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
    const { db } = await import("../server/db");
    return db.saveService(data);
  });

export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.deleteService(data);
  });

// Settings & Preferences
export const getSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getSettings();
});

export const saveSettingsFn = createServerFn({ method: "POST" })
  .validator((d: { email?: string; password?: string; notification_email?: string; whatsapp_number?: string }) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.saveSettings(data);
  });

export const saveIntegrationTogglesFn = createServerFn({ method: "POST" })
  .validator((d: Record<string, boolean>) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.saveIntegrationToggles(data);
  });

export const getRecentActivityFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("../server/db");
  return db.getRecentActivity();
});

export const addActivityLogFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    const { db } = await import("../server/db");
    return db.addActivityLog(data);
  });
