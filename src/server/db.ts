import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { caseStudies } from "../content/case-studies";
import { insights } from "../content/insights";
import { roles } from "../content/careers";
import { brand } from "../content/site";
import { homeFaqs, testimonials } from "../content/shared";

// Types
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

export interface CallLog {
  id: string;
  lead_id: string;
  call_provider: string;
  call_sid: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
  outcome: string;
  transcript: string;
  recording_url: string;
  created_at: string;
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
  body: string; // JSON string of `{ heading?: string, paragraphs: string[] }[]`
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
  responsibilities: string[]; // parsed from JSON
  requirements: string[]; // parsed from JSON
  nice_to_have: string[]; // parsed from JSON
  open: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
  label?: string;
  section: string;
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

// Env configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const isSupabaseEnabled = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

export const supabase = isSupabaseEnabled ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Local JSON file path for Mock Mode
const LOCAL_DB_DIR = path.resolve(process.cwd(), "src/content");
const LOCAL_DB_PATH = path.resolve(LOCAL_DB_DIR, "local_db.json");

// Default initial database state for Mock Mode
function generateDefaultDb() {
  const defaultLeads = [
    {
      id: "lead-1",
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      source: "experience_form",
      name: "Akshay Deshmukh",
      email: "akshay@techvibe.io",
      phone: "+91 98765 43210",
      service_interest: "ai_automation",
      problem_description: "We need an automated workflow that fetches our sales prospects from LinkedIn, enrichment, and syncs them to HubSpot.",
      status: "new",
      internal_notes: "Very interested in Clay integration.",
      lead_score: 9,
      lead_score_reason: "High urgency, budget alignment fits, clear automation pain points.",
      pain_points: "Manual prospecting on LinkedIn, manual HubSpot entry",
      budget_signal: "₹30,000–80,000",
      business_type: "B2B SaaS Agency",
      call_attempted_at: new Date(Date.now() - 2.8 * 3600000).toISOString(),
      call_answered: true,
      call_transcript: "AI: Hi Akshay, this is Aria from House of Workflow. I saw you requested an automation flow. Akshay: Yes, we are drowning in manual LinkedIn copy-pasting. AI: Got it, we can fully automate that. Let's schedule a call.",
      call_attempts: 1,
      call_outcome: "booked",
      meeting_datetime: new Date(Date.now() + 48 * 3600000).toISOString(),
      meeting_link: "meet.google.com/abc-defg-hij",
      meeting_confirmed: true,
      updated_at: new Date().toISOString(),
    },
    {
      id: "lead-2",
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      source: "book_a_call",
      name: "Sarah Jenkins",
      email: "s.jenkins@brightmedia.co",
      phone: "+1 415 555 0142",
      service_interest: "web_dev",
      problem_description: "Looking to build a custom SaaS client portal that handles client reporting and automated billing via Stripe.",
      status: "in_progress",
      internal_notes: "Scheduled diagnostic review.",
      lead_score: 7,
      lead_score_reason: "Standard SaaS portal layout request.",
      call_attempts: 0,
      meeting_confirmed: false,
      updated_at: new Date().toISOString(),
    },
    {
      id: "lead-3",
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      source: "experience_form",
      name: "Vikram Malhotra",
      email: "vikram@finscale.in",
      phone: "+91 91234 56789",
      service_interest: "both",
      problem_description: "Need a robust internal data pipeline to automate our monthly GST reconciliation. We pull raw invoices from three sources and want to compare data automatically.",
      status: "won",
      internal_notes: "Deal closed. Kickoff scheduled next Monday.",
      lead_score: 10,
      lead_score_reason: "High budget, ready to start immediately, highly technical and defined scope.",
      pain_points: "Manual GST reconciliation across 3 sources, invoice matching errors",
      budget_signal: "₹1,50,000+",
      business_type: "FinTech",
      call_attempts: 1,
      call_answered: true,
      call_transcript: "AI: Hi Vikram, Aria here. Reaching out about the GST reconciler. Vikram: We are ready to sign the SOW. AI: Excellent. I'll alert Jay.",
      call_outcome: "booked",
      meeting_confirmed: true,
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultPosts = insights.map((item, idx) => ({
    id: `post-${idx + 1}`,
    slug: item.slug,
    title: item.title,
    category: item.category,
    date: item.date,
    read_time: item.readTime,
    author: item.author,
    excerpt: item.excerpt,
    body: JSON.stringify(item.body),
    status: "published",
    seo_title: item.title,
    seo_description: item.excerpt,
    og_image_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const defaultProjects = caseStudies.map((item, idx) => ({
    id: `project-${idx + 1}`,
    slug: item.slug,
    title: item.title,
    industry_tag: item.industry,
    service_tag: item.service,
    context_body: item.summary,
    result_1_value: item.roi[0]?.value || "ROI metric",
    result_1_label: item.roi[0]?.label || "ROI label",
    result_2_value: item.roi[1]?.value || "ROI metric",
    result_2_label: item.roi[1]?.label || "ROI label",
    image_url: "",
    image_alt: item.title,
    sort_order: idx + 1,
    published: true,
    seo_title: item.title,
    seo_description: item.summary,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const defaultRoles = roles.map((item, idx) => ({
    id: `role-${idx + 1}`,
    slug: item.slug,
    title: item.title,
    team: item.team,
    location: item.location,
    type: item.type,
    salary_range: item.range,
    summary: item.summary,
    about: item.about,
    responsibilities: item.responsibilities,
    requirements: item.requirements,
    nice_to_have: item.niceToHave,
    open: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const defaultFaqs = homeFaqs.map((item, idx) => ({
    id: `faq-${idx + 1}`,
    question: item.q,
    answer: item.a,
    sort_order: idx + 1,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const defaultTestimonials = testimonials.map((item, idx) => ({
    id: `testimonial-${idx + 1}`,
    quote: item.text,
    author_name: item.name,
    author_title: item.role,
    author_company: item.company,
    published: true,
    sort_order: idx + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const defaultServices = [
    {
      id: "service-1",
      number: "01",
      name: "Web Development",
      tagline: "Built for conversion, not just appearance",
      description: "We build custom React and Next.js websites optimized for speed, search ranking, and capturing inbound pipeline. Built on pure design tokens, with zero code bloat.",
      featured: true,
      stat_1_val: "100%",
      stat_1_lbl: "custom design and responsive code",
      stat_2_val: "2–4 wks",
      stat_2_lbl: "average design-to-launch timeline",
      stat_3_val: "Instant",
      stat_3_lbl: "leads captured and routed the moment they land",
      sort_order: 1,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "service-2",
      number: "02",
      name: "AI Automation",
      tagline: "Your systems should run without manual handoffs",
      description: "We integrate your tech stack (HubSpot, Stripe, Slack, Clay, smart outreach) using custom serverless orchestrations and n8n workflows so manual admin work drops to zero.",
      featured: false,
      stat_1_val: "40%",
      stat_1_lbl: "average operational overhead reduction",
      stat_2_val: "3x",
      stat_2_lbl: "faster customer response time",
      stat_3_val: "24/7/365",
      stat_3_lbl: "autonomous pipeline routing",
      sort_order: 2,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultSiteContent = [
    { id: "c-1", key: "hero_tag", value: "WEB DEVELOPMENT & AI AUTOMATION", type: "text", section: "hero", label: "Tag line", updated_at: new Date().toISOString() },
    { id: "c-2", key: "hero_headline", value: "Your business should not run on manual work.", type: "html", section: "hero", label: "Headline", updated_at: new Date().toISOString() },
    { id: "c-3", key: "hero_subheadline", value: "We build high-performance websites and AI automation systems for startups, SaaS companies, agencies, enterprises, and growing businesses across 14 industries — so your team gets hours back, operations run without intervention, and revenue compounds on its own.", type: "text", section: "hero", label: "Subheadline", updated_at: new Date().toISOString() },
    { id: "c-4", key: "hero_cta1_text", value: "Book a discovery call", type: "text", section: "hero", label: "CTA Button 1 Text", updated_at: new Date().toISOString() },
    { id: "c-5", key: "hero_cta1_url", value: "https://cal.com/houseofworkflow", type: "url", section: "hero", label: "CTA Button 1 URL", updated_at: new Date().toISOString() },
    { id: "c-6", key: "hero_cta2_text", value: "View Portfolio", type: "text", section: "hero", label: "CTA Button 2 Text", updated_at: new Date().toISOString() },
    { id: "c-7", key: "hero_cta2_url", value: "/portfolio", type: "url", section: "hero", label: "CTA Button 2 URL", updated_at: new Date().toISOString() },
    { id: "c-8", key: "hero_stat1_num", value: "40%", type: "text", section: "hero", label: "Stat 1 - Value", updated_at: new Date().toISOString() },
    { id: "c-9", key: "hero_stat1_label", value: "Average reduction in operational overhead after automation", type: "text", section: "hero", label: "Stat 1 - Label", updated_at: new Date().toISOString() },
    { id: "c-10", key: "hero_stat2_num", value: "3x", type: "text", section: "hero", label: "Stat 2 - Value", updated_at: new Date().toISOString() },
    { id: "c-11", key: "hero_stat2_label", value: "Faster lead and customer response with automated pipelines", type: "text", section: "hero", label: "Stat 2 - Label", updated_at: new Date().toISOString() },
    { id: "c-12", key: "hero_stat3_num", value: "4 wks", type: "text", section: "hero", label: "Stat 3 - Value", updated_at: new Date().toISOString() },
    { id: "c-13", key: "hero_stat3_label", value: "From discovery call to first live automation in production", type: "text", section: "hero", label: "Stat 3 - Label", updated_at: new Date().toISOString() },
    { id: "c-14", key: "problem_tag", value: "THE COST OF THE STATUS QUO", type: "text", section: "problem", label: "Section tag", updated_at: new Date().toISOString() },
    { id: "c-15", key: "problem_headline", value: "Thousands of hours a year, spent on work your systems should already be doing.", type: "html", section: "problem", label: "Headline", updated_at: new Date().toISOString() },
    { id: "c-16", key: "problem_body", value: "It rarely looks like a crisis — it looks like a team spending hours every day copy-pasting data between Salesforce, HubSpot, and Google Sheets, manually scheduling client reporting metrics, or losing track of inbound signups because they didn't follow up in 5 minutes. That is a process tax you pay every week.", type: "text", section: "problem", label: "Body copy", updated_at: new Date().toISOString() },
    { id: "c-17", key: "problem_link_text", value: "Read how we solve this by industry", type: "text", section: "problem", label: "Link text", updated_at: new Date().toISOString() },
    { id: "c-18", key: "problem_link_url", value: "/services", type: "url", section: "problem", label: "Link URL", updated_at: new Date().toISOString() },
    { id: "c-19", key: "problem_stat1_num", value: "31%", type: "text", section: "problem", label: "Stat 1 - Value", updated_at: new Date().toISOString() },
    { id: "c-20", key: "problem_stat1_desc", value: "of a knowledge worker's week is spent on tasks a system could handle", type: "text", section: "problem", label: "Stat 1 - Description", updated_at: new Date().toISOString() },
    { id: "c-21", key: "problem_stat2_num", value: "19%", type: "text", section: "problem", label: "Stat 2 - Value", updated_at: new Date().toISOString() },
    { id: "c-22", key: "problem_stat2_desc", value: "of process hours are duplicated work caused by disconnected tools", type: "text", section: "problem", label: "Stat 2 - Description", updated_at: new Date().toISOString() },
    { id: "c-23", key: "problem_stat3_num", value: "6", type: "text", section: "problem", label: "Stat 3 - Value", updated_at: new Date().toISOString() },
    { id: "c-24", key: "problem_stat3_desc", value: "average number of software tools touched in a single customer request", type: "text", section: "problem", label: "Stat 3 - Description", updated_at: new Date().toISOString() },
    { id: "c-25", key: "problem_stat4_num", value: "1", type: "text", section: "problem", label: "Stat 4 - Value", updated_at: new Date().toISOString() },
    { id: "c-26", key: "problem_stat4_desc", value: "person in most companies who genuinely understands the full end-to-end process", type: "text", section: "problem", label: "Stat 4 - Description", updated_at: new Date().toISOString() },
    { id: "c-27", key: "team_tag", value: "// THE TEAM", type: "text", section: "team", label: "Section tag", updated_at: new Date().toISOString() },
    { id: "c-28", key: "team_headline", value: "Small team. Serious output.", type: "text", section: "team", label: "Headline", updated_at: new Date().toISOString() },
    { id: "c-29", key: "team_body", value: "We built House Of Workflow because we kept seeing the same thing — great businesses held back by manual processes and disconnected tools. We're builders based in Pune. We fix that.", type: "text", section: "team", label: "Body copy", updated_at: new Date().toISOString() },
    { id: "c-30", key: "footer_name", value: "House Of Workflow", type: "text", section: "footer", label: "Agency name", updated_at: new Date().toISOString() },
    { id: "c-31", key: "footer_tagline", value: "Web development and AI automation for businesses that intend to scale.", type: "text", section: "footer", label: "Tagline", updated_at: new Date().toISOString() },
    { id: "c-32", key: "footer_email", value: "hello@houseofworkflow.com", type: "text", section: "footer", label: "Support email", updated_at: new Date().toISOString() },
    { id: "c-33", key: "footer_location", value: "Pune, Maharashtra, India", type: "text", section: "footer", label: "City / Location", updated_at: new Date().toISOString() },
    { id: "c-34", key: "footer_copyright", value: "© 2026 House Of Workflow. All rights reserved.", type: "text", section: "footer", label: "Copyright text", updated_at: new Date().toISOString() },
  ];

  return {
    settings: {
      email: "admin@houseofworkflow.com",
      password: "admin",
      notification_email: "admin@houseofworkflow.com",
      whatsapp_number: "+919876543210",
      integrations: {
        hubspot: true,
        slack: true,
        stripe: true,
        openai: true,
        make: true,
        zapier: false,
      },
    },
    leads: defaultLeads,
    call_logs: [],
    posts: defaultPosts,
    projects: defaultProjects,
    roles: defaultRoles,
    faq_items: defaultFaqs,
    testimonials: defaultTestimonials,
    services: defaultServices,
    site_content: defaultSiteContent,
    activity_log: [
      { id: "act-1", message: "Admin signed in", timestamp: new Date(Date.now() - 1000 * 60).toISOString() },
      { id: "act-2", message: "Initial contents seeded successfully", timestamp: new Date(Date.now() - 1000 * 120).toISOString() },
    ],
  };
}

// Sync read/write functions for local JSON DB
export function readLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    const defaults = generateDefaultDb();
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaults, null, 2), "utf-8");
    return defaults;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read local DB, resetting to default", err);
    const defaults = generateDefaultDb();
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaults, null, 2), "utf-8");
    return defaults;
  }
}

export function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local DB", err);
  }
}

// Unified Database Layer API
export const db = {
  // Server-side authentication check helper
  async checkAdminAuth(sessionToken: string | null): Promise<boolean> {
    if (!sessionToken) return false;
    if (isSupabaseEnabled) {
      const { data: { user }, error } = await supabase!.auth.getUser(sessionToken);
      if (error || !user) return false;
      const { data: roleData } = await supabase!
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return roleData?.role === "admin";
    } else {
      return sessionToken === "mock-admin-session-id";
    }
  },

  async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; session?: string; error?: string }> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return { success: false, error: error?.message || "Invalid credentials" };
      }
      const { data: roleData } = await supabase!
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();
      if (roleData?.role !== "admin") {
        await supabase!.auth.signOut();
        return { success: false, error: "Access denied. User is not an admin." };
      }
      return { success: true, session: data.session.access_token };
    } else {
      const local = readLocalDb();
      if (local.settings.email === email && local.settings.password === password) {
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Admin signed in successfully from email ${email}`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return { success: true, session: "mock-admin-session-id" };
      }
      return { success: false, error: "Incorrect email or password." };
    }
  },

  // LEADS CRUD
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.leads;
    }
  },

  async getLead(id: string): Promise<Lead | null> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!.from("leads").select("*").eq("id", id).single();
      if (error) return null;
      return data;
    } else {
      const local = readLocalDb();
      return local.leads.find((l: any) => l.id === id) || null;
    }
  },

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const email = leadData.email?.toLowerCase().trim() || "";
    
    if (isSupabaseEnabled) {
      if (email) {
        const { data: existingLeads } = await supabase!
          .from("leads")
          .select("*")
          .eq("email", email);
        
        if (existingLeads && existingLeads.length > 0) {
          const existing = existingLeads[0];
          const { data, error } = await supabase!
            .from("leads")
            .update({
              ...leadData,
              status: leadData.status || existing.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }
      
      const { data, error } = await supabase!
        .from("leads")
        .insert([{ ...leadData, status: leadData.status || "new" }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const local = readLocalDb();
      
      if (email) {
        const existingIdx = local.leads.findIndex((l: any) => l.email.toLowerCase() === email);
        if (existingIdx !== -1) {
          const existing = local.leads[existingIdx];
          const updated = {
            ...existing,
            ...leadData,
            status: leadData.status || existing.status,
            updated_at: new Date().toISOString(),
          };
          local.leads[existingIdx] = updated;
          
          local.activity_log.unshift({
            id: `act-${Date.now()}`,
            message: `Lead updated via form/webhook: ${updated.name} (${updated.email})`,
            timestamp: new Date().toISOString(),
          });
          
          writeLocalDb(local);
          return updated;
        }
      }

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        created_at: new Date().toISOString(),
        source: leadData.source || "experience_form",
        name: leadData.name || "Anonymous",
        email: leadData.email || "",
        phone: leadData.phone || "",
        service_interest: leadData.service_interest || "not_sure",
        problem_description: leadData.problem_description || "",
        status: leadData.status || "new",
        internal_notes: leadData.internal_notes || "",
        lead_score: leadData.lead_score,
        lead_score_reason: leadData.lead_score_reason || "",
        pain_points: leadData.pain_points || "",
        budget_signal: leadData.budget_signal || "",
        business_type: leadData.business_type || "",
        call_attempted_at: leadData.call_attempted_at,
        call_answered: leadData.call_answered,
        call_transcript: leadData.call_transcript || "",
        call_attempts: leadData.call_attempts || 0,
        call_outcome: leadData.call_outcome || "",
        meeting_datetime: leadData.meeting_datetime,
        meeting_link: leadData.meeting_link || "",
        meeting_confirmed: leadData.meeting_confirmed || false,
        calendly_event_id: leadData.calendly_event_id || "",
        updated_at: new Date().toISOString(),
      };
      
      local.leads.unshift(newLead);
      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `New lead captured: ${newLead.name} (${newLead.email})`,
        timestamp: new Date().toISOString(),
      });
      writeLocalDb(local);
      return newLead;
    }
  },

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const local = readLocalDb();
      const idx = local.leads.findIndex((l: any) => l.id === id);
      if (idx === -1) throw new Error("Lead not found");
      const oldStatus = local.leads[idx].status;
      local.leads[idx].status = status;
      local.leads[idx].updated_at = new Date().toISOString();
      
      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `Lead status changed: ${local.leads[idx].name} (${oldStatus} -> ${status})`,
        timestamp: new Date().toISOString(),
      });
      
      writeLocalDb(local);
      return local.leads[idx];
    }
  },

  async updateLeadNotes(id: string, notes: string): Promise<Lead> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("leads")
        .update({ internal_notes: notes, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const local = readLocalDb();
      const idx = local.leads.findIndex((l: any) => l.id === id);
      if (idx === -1) throw new Error("Lead not found");
      local.leads[idx].internal_notes = notes;
      local.leads[idx].updated_at = new Date().toISOString();
      
      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `Internal notes updated for lead: ${local.leads[idx].name}`,
        timestamp: new Date().toISOString(),
      });
      
      writeLocalDb(local);
      return local.leads[idx];
    }
  },

  async deleteLead(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("leads").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      const lead = local.leads.find((l: any) => l.id === id);
      local.leads = local.leads.filter((l: any) => l.id !== id);
      
      if (lead) {
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Lead deleted: ${lead.name}`,
          timestamp: new Date().toISOString(),
        });
      }
      writeLocalDb(local);
      return true;
    }
  },

  // BLOG POSTS CRUD
  async getPosts(): Promise<BlogPost[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("posts")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.posts;
    }
  },

  async getPost(idOrSlug: string): Promise<BlogPost | null> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("posts")
        .select("*")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();
      if (error) return null;
      return data;
    } else {
      const local = readLocalDb();
      return local.posts.find((p: any) => p.id === idOrSlug || p.slug === idOrSlug) || null;
    }
  },

  async savePost(postData: Partial<BlogPost>): Promise<BlogPost> {
    if (isSupabaseEnabled) {
      if (postData.id) {
        const { data, error } = await supabase!
          .from("posts")
          .update({ ...postData, updated_at: new Date().toISOString() })
          .eq("id", postData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase!
          .from("posts")
          .insert([postData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const local = readLocalDb();
      if (postData.id) {
        const idx = local.posts.findIndex((p: any) => p.id === postData.id);
        if (idx === -1) throw new Error("Post not found");
        const updated = {
          ...local.posts[idx],
          ...postData,
          updated_at: new Date().toISOString(),
        };
        local.posts[idx] = updated;
        
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Blog post updated: "${updated.title}"`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return updated;
      } else {
        const newPost: BlogPost = {
          id: `post-${Date.now()}`,
          slug: postData.slug || "new-post",
          title: postData.title || "Untitled Post",
          category: postData.category || "General",
          date: postData.date || new Date().toISOString().split("T")[0],
          read_time: postData.read_time || "5 min",
          author: postData.author || "Jay Mahajan",
          excerpt: postData.excerpt || "",
          body: postData.body || "[]",
          status: postData.status || "draft",
          seo_title: postData.seo_title || postData.title || "",
          seo_description: postData.seo_description || postData.excerpt || "",
          og_image_url: postData.og_image_url || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.posts.unshift(newPost);
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `New blog post created: "${newPost.title}"`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return newPost;
      }
    }
  },

  async deletePost(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("posts").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      const post = local.posts.find((p: any) => p.id === id);
      local.posts = local.posts.filter((p: any) => p.id !== id);
      if (post) {
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Blog post deleted: "${post.title}"`,
          timestamp: new Date().toISOString(),
        });
      }
      writeLocalDb(local);
      return true;
    }
  },

  // PORTFOLIO PROJECTS CRUD
  async getProjects(): Promise<Project[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.projects.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
  },

  async getProject(idOrSlug: string): Promise<Project | null> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("projects")
        .select("*")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();
      if (error) return null;
      return data;
    } else {
      const local = readLocalDb();
      return local.projects.find((p: any) => p.id === idOrSlug || p.slug === idOrSlug) || null;
    }
  },

  async saveProject(projData: Partial<Project>): Promise<Project> {
    if (isSupabaseEnabled) {
      if (projData.id) {
        const { data, error } = await supabase!
          .from("projects")
          .update({ ...projData, updated_at: new Date().toISOString() })
          .eq("id", projData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase!
          .from("projects")
          .insert([projData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const local = readLocalDb();
      if (projData.id) {
        const idx = local.projects.findIndex((p: any) => p.id === projData.id);
        if (idx === -1) throw new Error("Project not found");
        const updated = {
          ...local.projects[idx],
          ...projData,
          updated_at: new Date().toISOString(),
        };
        local.projects[idx] = updated;
        
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Portfolio case study updated: "${updated.title}"`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return updated;
      } else {
        const newProj: Project = {
          id: `project-${Date.now()}`,
          slug: projData.slug || "new-case-study",
          title: projData.title || "New Case Study",
          industry_tag: projData.industry_tag || "General",
          service_tag: projData.service_tag || "AI Automation",
          context_body: projData.context_body || "",
          result_1_value: projData.result_1_value || "",
          result_1_label: projData.result_1_label || "",
          result_2_value: projData.result_2_value || "",
          result_2_label: projData.result_2_label || "",
          image_url: projData.image_url || "",
          image_alt: projData.image_alt || "",
          sort_order: projData.sort_order || 99,
          published: projData.published || false,
          seo_title: projData.seo_title || projData.title || "",
          seo_description: projData.seo_description || projData.context_body || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.projects.push(newProj);
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `New case study created: "${newProj.title}"`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return newProj;
      }
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("projects").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      const proj = local.projects.find((p: any) => p.id === id);
      local.projects = local.projects.filter((p: any) => p.id !== id);
      if (proj) {
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Case study deleted: "${proj.title}"`,
          timestamp: new Date().toISOString(),
        });
      }
      writeLocalDb(local);
      return true;
    }
  },

  // CAREERS ROLES CRUD
  async getRoles(): Promise<CareerRole[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.roles;
    }
  },

  async getRole(idOrSlug: string): Promise<CareerRole | null> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("roles")
        .select("*")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();
      if (error) return null;
      return data;
    } else {
      const local = readLocalDb();
      return local.roles.find((r: any) => r.id === idOrSlug || r.slug === idOrSlug) || null;
    }
  },

  async saveRole(roleData: Partial<CareerRole>): Promise<CareerRole> {
    if (isSupabaseEnabled) {
      if (roleData.id) {
        const { data, error } = await supabase!
          .from("roles")
          .update({ ...roleData, updated_at: new Date().toISOString() })
          .eq("id", roleData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase!
          .from("roles")
          .insert([roleData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const local = readLocalDb();
      if (roleData.id) {
        const idx = local.roles.findIndex((r: any) => r.id === roleData.id);
        if (idx === -1) throw new Error("Role not found");
        const updated = {
          ...local.roles[idx],
          ...roleData,
          updated_at: new Date().toISOString(),
        };
        local.roles[idx] = updated;
        
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Career role updated: "${updated.title}"`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return updated;
      } else {
        const newRole: CareerRole = {
          id: `role-${Date.now()}`,
          slug: roleData.slug || "new-job",
          title: roleData.title || "New Role",
          team: roleData.team || "Engineering",
          location: roleData.location || "Pune, India (Remote-friendly)",
          type: roleData.type || "Full-time",
          salary_range: roleData.salary_range || "",
          summary: roleData.summary || "",
          about: roleData.about || "",
          responsibilities: roleData.responsibilities || [],
          requirements: roleData.requirements || [],
          nice_to_have: roleData.nice_to_have || [],
          open: roleData.open !== undefined ? roleData.open : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.roles.unshift(newRole);
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `New career listing created: "${newRole.title}"`,
          timestamp: new Date().toISOString(),
        });
        writeLocalDb(local);
        return newRole;
      }
    }
  },

  async deleteRole(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("roles").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      const role = local.roles.find((r: any) => r.id === id);
      local.roles = local.roles.filter((r: any) => r.id !== id);
      if (role) {
        local.activity_log.unshift({
          id: `act-${Date.now()}`,
          message: `Career role listing deleted: "${role.title}"`,
          timestamp: new Date().toISOString(),
        });
      }
      writeLocalDb(local);
      return true;
    }
  },

  // SITE CONTENT CMS CRUD
  async getSiteContent(): Promise<Record<string, string>> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!.from("site_content").select("key, value");
      if (error) throw error;
      const res: Record<string, string> = {};
      data?.forEach((row) => {
        res[row.key] = row.value;
      });
      return res;
    } else {
      const local = readLocalDb();
      const res: Record<string, string> = {};
      local.site_content.forEach((row: any) => {
        res[row.key] = row.value;
      });
      return res;
    }
  },

  async getSiteContentMeta(): Promise<SiteContent[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!.from("site_content").select("*");
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.site_content;
    }
  },

  async saveSiteContent(key: string, value: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!
        .from("site_content")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      const idx = local.site_content.findIndex((c: any) => c.key === key);
      if (idx !== -1) {
        local.site_content[idx].value = value;
        local.site_content[idx].updated_at = new Date().toISOString();
      } else {
        local.site_content.push({
          id: `c-${Date.now()}`,
          key,
          value,
          section: key.split("_")[0] || "general",
          type: "text",
          updated_at: new Date().toISOString(),
        });
      }
      
      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `Homepage CMS setting updated: ${key}`,
        timestamp: new Date().toISOString(),
      });
      writeLocalDb(local);
      return true;
    }
  },

  // FAQ ITEMS CRUD
  async getFaqs(): Promise<FaqItem[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("faq_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.faq_items.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
  },

  async saveFaq(faqData: Partial<FaqItem>): Promise<FaqItem> {
    if (isSupabaseEnabled) {
      if (faqData.id) {
        const { data, error } = await supabase!
          .from("faq_items")
          .update({ ...faqData, updated_at: new Date().toISOString() })
          .eq("id", faqData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase!
          .from("faq_items")
          .insert([faqData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const local = readLocalDb();
      if (faqData.id) {
        const idx = local.faq_items.findIndex((f: any) => f.id === faqData.id);
        if (idx === -1) throw new Error("FAQ not found");
        const updated = {
          ...local.faq_items[idx],
          ...faqData,
          updated_at: new Date().toISOString(),
        };
        local.faq_items[idx] = updated;
        writeLocalDb(local);
        return updated;
      } else {
        const newFaq: FaqItem = {
          id: `faq-${Date.now()}`,
          question: faqData.question || "",
          answer: faqData.answer || "",
          sort_order: faqData.sort_order || 99,
          published: faqData.published !== undefined ? faqData.published : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.faq_items.push(newFaq);
        writeLocalDb(local);
        return newFaq;
      }
    }
  },

  async deleteFaq(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("faq_items").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      local.faq_items = local.faq_items.filter((f: any) => f.id !== id);
      writeLocalDb(local);
      return true;
    }
  },

  // TESTIMONIALS CRUD
  async getTestimonials(): Promise<Testimonial[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.testimonials.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
  },

  async saveTestimonial(testData: Partial<Testimonial>): Promise<Testimonial> {
    if (isSupabaseEnabled) {
      if (testData.id) {
        const { data, error } = await supabase!
          .from("testimonials")
          .update({ ...testData, updated_at: new Date().toISOString() })
          .eq("id", testData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase!
          .from("testimonials")
          .insert([testData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const local = readLocalDb();
      if (testData.id) {
        const idx = local.testimonials.findIndex((t: any) => t.id === testData.id);
        if (idx === -1) throw new Error("Testimonial not found");
        const updated = {
          ...local.testimonials[idx],
          ...testData,
          updated_at: new Date().toISOString(),
        };
        local.testimonials[idx] = updated;
        writeLocalDb(local);
        return updated;
      } else {
        const newTest: Testimonial = {
          id: `testimonial-${Date.now()}`,
          quote: testData.quote || "",
          author_name: testData.author_name || "",
          author_title: testData.author_title || "",
          author_company: testData.author_company || "",
          published: testData.published !== undefined ? testData.published : false,
          sort_order: testData.sort_order || 99,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.testimonials.push(newTest);
        writeLocalDb(local);
        return newTest;
      }
    }
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      local.testimonials = local.testimonials.filter((t: any) => t.id !== id);
      writeLocalDb(local);
      return true;
    }
  },

  // SERVICES CRUD
  async getServices(): Promise<ServiceItem[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase!
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.services.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
  },

  async saveService(serviceData: Partial<ServiceItem>): Promise<ServiceItem> {
    if (isSupabaseEnabled) {
      if (serviceData.id) {
        const { data, error } = await supabase!
          .from("services")
          .update({ ...serviceData, updated_at: new Date().toISOString() })
          .eq("id", serviceData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase!
          .from("services")
          .insert([serviceData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const local = readLocalDb();
      if (serviceData.id) {
        const idx = local.services.findIndex((s: any) => s.id === serviceData.id);
        if (idx === -1) throw new Error("Service not found");
        const updated = {
          ...local.services[idx],
          ...serviceData,
          updated_at: new Date().toISOString(),
        };
        local.services[idx] = updated;
        writeLocalDb(local);
        return updated;
      } else {
        const newService: ServiceItem = {
          id: `service-${Date.now()}`,
          number: serviceData.number || "01",
          name: serviceData.name || "New Service",
          tagline: serviceData.tagline || "",
          description: serviceData.description || "",
          featured: serviceData.featured || false,
          stat_1_val: serviceData.stat_1_val || "",
          stat_1_lbl: serviceData.stat_1_lbl || "",
          stat_2_val: serviceData.stat_2_val || "",
          stat_2_lbl: serviceData.stat_2_lbl || "",
          stat_3_val: serviceData.stat_3_val || "",
          stat_3_lbl: serviceData.stat_3_lbl || "",
          sort_order: serviceData.sort_order || 99,
          published: serviceData.published !== undefined ? serviceData.published : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.services.push(newService);
        writeLocalDb(local);
        return newService;
      }
    }
  },

  async deleteService(id: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("services").delete().eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const local = readLocalDb();
      local.services = local.services.filter((s: any) => s.id !== id);
      writeLocalDb(local);
      return true;
    }
  },

  // CONFIG / PREFERENCES CRUD
  async getSettings(): Promise<any> {
    const local = readLocalDb();
    return {
      email: local.settings.email,
      whatsapp_number: local.settings.whatsapp_number,
      notification_email: local.settings.notification_email,
      integrations: local.settings.integrations,
    };
  },

  async saveSettings(settingsData: { email?: string; password?: string; notification_email?: string; whatsapp_number?: string }): Promise<boolean> {
    const local = readLocalDb();
    if (settingsData.email) local.settings.email = settingsData.email;
    if (settingsData.password) local.settings.password = settingsData.password;
    if (settingsData.notification_email) local.settings.notification_email = settingsData.notification_email;
    if (settingsData.whatsapp_number) local.settings.whatsapp_number = settingsData.whatsapp_number;
    
    local.activity_log.unshift({
      id: `act-${Date.now()}`,
      message: `Admin account/notification settings updated`,
      timestamp: new Date().toISOString(),
    });
    writeLocalDb(local);
    return true;
  },

  async saveIntegrationToggles(integrations: Record<string, boolean>): Promise<boolean> {
    const local = readLocalDb();
    local.settings.integrations = {
      ...local.settings.integrations,
      ...integrations,
    };
    writeLocalDb(local);
    return true;
  },

  async getRecentActivity(): Promise<any[]> {
    const local = readLocalDb();
    return local.activity_log.slice(0, 20); // last 20
  },

  async addActivityLog(message: string): Promise<void> {
    const local = readLocalDb();
    local.activity_log.unshift({
      id: `act-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
    });
    writeLocalDb(local);
  },
};
