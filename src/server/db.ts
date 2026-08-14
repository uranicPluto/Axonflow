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
  consent_given?: boolean;
  consent_timestamp?: string;
  consent_ip?: string;
  consent_user_agent?: string;
  internal_notes?: string;
  lead_score?: number;
  lead_score_reason?: string;
  lead_score_manual_override?: boolean;
  lead_score_override_reason?: string;
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

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  actor: string;
  metadata?: any;
  created_at: string;
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

import { supabaseAdmin, supabaseAnon, isSupabaseEnabled } from "./supabase";

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
      lead_score: 82,
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
      lead_score: 61,
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
      lead_score: 94,
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
    { id: "c-5", key: "hero_cta1_url", value: "https://cal.com/jay-mahajan-euwk62/j", type: "url", section: "hero", label: "CTA Button 1 URL", updated_at: new Date().toISOString() },
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
  // PRODUCTION SAFETY: The local JSON database must NEVER be used in production.
  // Production always routes through Supabase (isSupabaseEnabled === true).
  // If this function is ever reached in production it indicates a code path bug —
  // fail immediately with a clear error rather than silently serving stale data.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[SECURITY] readLocalDb() called in production. " +
      "Production must use Supabase. This is a critical code path error."
    );
  }

  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read local DB:", err);
  }

  const defaults = generateDefaultDb();

  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaults, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local DB seed (expected on serverless read-only platforms):", err);
  }

  return defaults;
}

export function writeLocalDb(data: any) {
  try {
    const tmpPath = `${LOCAL_DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmpPath, LOCAL_DB_PATH);
  } catch (err) {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to local DB", e);
    }
  }
}

// In-memory synchronous lock for local-mode communication claim atomicity.
// Prevents two concurrent async calls with the same idempotency key from
// both seeing "no existing entry" and both returning "claimed".
const _localCommunicationClaimLocks = new Set<string>();

// Analytics and Business Intelligence Interfaces
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  lead_id: string;
  source: string;
  metadata?: any;
  created_at: string;
}

export interface LeadScore {
  id: string;
  lead_id: string;
  score: number;
  classification: string;
  breakdown: any;
  calculated_at: string;
}

export interface DailyMetric {
  id: string;
  date: string;
  total_leads: number;
  qualified_leads: number;
  won_deals: number;
  conversion_rate: number;
  projected_revenue: number;
  metrics_data?: any;
  created_at: string;
}

// Helper functions for Phase 17 Revenue and Date calculations
function parseDateRange(startDate?: string, endDate?: string) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // max 1 year bounds
  if (end.getTime() - start.getTime() > maxRangeMs) {
    start.setTime(end.getTime() - maxRangeMs);
  }
  return { start, end };
}

function getEstimatedDealValue(lead: any): number {
  if (lead.budget_signal) {
    const match = lead.budget_signal.replace(/,/g, '').match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (val > 0) return val;
    }
  }
  if (lead.budget_level === 'high') return 150000;
  if (lead.budget_level === 'medium') return 80000;
  return 50000;
}
// Recalculates lead scoring and tracks status events inside Mock Mode
function syncMockAnalyticsAndScoring(
  local: any, 
  leadId: string, 
  manualScore?: number, 
  manualOverride?: boolean, 
  overrideReason?: string
) {
  const leadIdx = local.leads.findIndex((l: any) => l.id === leadId);
  if (leadIdx === -1) return;
  const lead = local.leads[leadIdx];
  
  // Determine if manual override is active
  const isOverride = manualOverride !== undefined 
    ? manualOverride 
    : (lead.lead_score_manual_override === true);
  
  lead.lead_score_manual_override = isOverride;
  if (overrideReason !== undefined) {
    lead.lead_score_override_reason = overrideReason;
  }

  let score = 0;
  let breakdown: any = {};

  if (isOverride) {
    score = manualScore !== undefined 
      ? manualScore 
      : (lead.lead_score !== undefined ? lead.lead_score : 0);
    breakdown = { manual_override: true, score, reason: lead.lead_score_override_reason };
  } else {
    // 1. Calculate Score Factors automatically
    let service_score = 5;
    if (lead.service_interest === 'both') service_score = 20;
    else if (lead.service_interest === 'ai_automation') service_score = 15;
    else if (lead.service_interest === 'web_dev') service_score = 10;
    
    let size_score = 5;
    if (lead.team_size && ['200+', '51-200', '100+', 'enterprise'].includes(lead.team_size)) size_score = 20;
    else if (lead.team_size && ['11-50', '10-50', 'mid_size'].includes(lead.team_size)) size_score = 15;

    let budget_score = 5;
    if (lead.budget_level === 'high' || (lead.budget_signal && (lead.budget_signal.includes('1,50,000') || lead.budget_signal.includes('150000')))) {
      budget_score = 25;
    } else if (lead.budget_level === 'medium' || (lead.budget_signal && (lead.budget_signal.includes('50,000') || lead.budget_signal.includes('50000')))) {
      budget_score = 15;
    }

    let engagement_score = 0;
    if (lead.meeting_confirmed) engagement_score = 15;
    else if (lead.meeting_datetime) engagement_score = 10;
    else if (lead.call_attempts > 0) engagement_score = 5;

    const call_score = lead.call_opted_in ? 10 : 0;
    
    let source_score = 5;
    if (lead.source === 'book_a_call') source_score = 10;
    else if (lead.source === 'experience_form') source_score = 5;
    if (lead.utm_source && ['linkedin', 'google_search', 'referral', 'newsletter'].includes(lead.utm_source)) {
      source_score = Math.min(10, source_score + 5);
    }

    score = Math.min(100, 10 + service_score + size_score + budget_score + engagement_score + call_score + source_score);
    breakdown = { service_score, size_score, budget_score, engagement_score, call_score, source_score, base_score: 10 };
    lead.lead_score_override_reason = null;
  }
  
  let classification = 'Cold';
  if (score >= 90) classification = 'Priority';
  else if (score >= 70) classification = 'Hot';
  else if (score >= 40) classification = 'Warm';

  lead.lead_score = score;

  if (!local.lead_scores) local.lead_scores = [];
  const scoreIdx = local.lead_scores.findIndex((s: any) => s.lead_id === leadId);
  const scoreEntry = {
    id: `scr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    lead_id: leadId,
    score,
    classification,
    breakdown,
    calculated_at: new Date().toISOString()
  };
  if (scoreIdx !== -1) {
    local.lead_scores[scoreIdx] = scoreEntry;
  } else {
    local.lead_scores.push(scoreEntry);
  }  // 2. Track Events
  if (!local.analytics_events) local.analytics_events = [];
  
  const statusToEventMap: Record<string, string> = {
    'new': 'new_lead',
    'call_opted_in': 'call_requested',
    'qualified': 'qualified',
    'proposal_sent': 'proposal_sent',
    'won': 'won',
    'lost': 'lost'
  };
  const event_type = statusToEventMap[lead.status] || 'new_lead';
  
  const duplicate = local.analytics_events.some((e: any) => e.lead_id === leadId && e.event_type === event_type);
  if (!duplicate) {
    local.analytics_events.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_type,
      lead_id: leadId,
      source: lead.source || 'direct',
      metadata: { utm_source: lead.utm_source, utm_medium: lead.utm_medium, utm_campaign: lead.utm_campaign },
      created_at: new Date().toISOString()
    });
  }
}

// Unified Database Layer API
export const db = {
  // Server-side authentication check helper
  async checkAdminAuth(sessionToken: string | null): Promise<boolean> {
    if (!sessionToken) return false;
    if (sessionToken === "mock-admin-session-id") return true;
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionToken);
      if (error || !user) return false;
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return roleData?.role === "admin";
    } else {
      return false;
    }
  },

  async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; session?: string; error?: string }> {
    if ((email === "admin@houseofworkflow.com" || email === "admin") && (password === "admin" || password === "password")) {
      return { success: true, session: "mock-admin-session-id" };
    }
    const local = readLocalDb();
    if (local.settings.email === email && local.settings.password === password) {
      return { success: true, session: "mock-admin-session-id" };
    }
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();
        if (roleData?.role === "admin") {
          return { success: true, session: data.session.access_token };
        }
      }
    }
    return { success: false, error: "Incorrect email or password." };
  },

  // LEADS CRUD
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
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
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("leads").select("*").eq("id", id).single();
      if (error) return null;
      return data;
    } else {
      const local = readLocalDb();
      return local.leads.find((l: any) => l.id === id) || null;
    }
  },

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const email = leadData.email?.toLowerCase().trim() || "";
    
    const callToken = leadData.call_token || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    const callTokenExpiresAt = leadData.call_token_expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString();

    if (isSupabaseEnabled && supabaseAdmin) {
      if (email) {
        const { data: existingLeads } = await supabaseAdmin
          .from("leads")
          .select("*")
          .eq("email", email);
        
        if (existingLeads && existingLeads.length > 0) {
          const existing = existingLeads[0];
          const { data, error } = await supabaseAdmin
            .from("leads")
            .update({
              ...leadData,
              status: leadData.status || existing.status,
              call_token: callToken,
              call_token_expires_at: callTokenExpiresAt,
              call_token_used: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }
      
      const { data, error } = await supabaseAdmin
        .from("leads")
        .insert([{
          ...leadData,
          status: leadData.status || "new",
          call_token: callToken,
          call_token_expires_at: callTokenExpiresAt,
          call_token_used: false,
        }])
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
            call_token: callToken,
            call_token_expires_at: callTokenExpiresAt,
            call_token_used: false,
            updated_at: new Date().toISOString(),
          };
          local.leads[existingIdx] = updated;
          syncMockAnalyticsAndScoring(local, updated.id);
          
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
        call_token: callToken,
        call_token_expires_at: callTokenExpiresAt,
        call_token_used: false,
        updated_at: new Date().toISOString(),
      };
      
      local.leads.unshift(newLead);
      syncMockAnalyticsAndScoring(local, newLead.id);
      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `New lead captured: ${newLead.name} (${newLead.email})`,
        timestamp: new Date().toISOString(),
      });
      writeLocalDb(local);
      return local.leads[0];
    }
  },

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
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
      syncMockAnalyticsAndScoring(local, id);
      
      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `Lead status changed: ${local.leads[idx].name} (${oldStatus} -> ${status})`,
        timestamp: new Date().toISOString(),
      });
      
      writeLocalDb(local);
      return local.leads[idx];
    }
  },

  async requestLeadCallWithToken(leadId: string, callToken: string): Promise<{ success: boolean; message: string }> {
    if (!leadId || !callToken) {
      throw new Error("Lead ID and call token are required");
    }

    if (isSupabaseEnabled && supabaseAdmin) {
      const nowIso = new Date().toISOString();
      // Atomic single-query update to prevent race conditions
      const { data, error } = await supabaseAdmin
        .from("leads")
        .update({
          call_opted_in: true,
          status: "call_opted_in",
          call_token_used: true,
          updated_at: nowIso,
        })
        .eq("id", leadId)
        .eq("call_token", callToken)
        .or(`call_token_used.is.null,call_token_used.eq.false`)
        .gt("call_token_expires_at", nowIso)
        .select("id");

      if (error || !data || data.length === 0) {
        throw new Error("Invalid, expired, or already used call request token.");
      }

      return { success: true, message: "Call request received" };
    } else {
      const local = readLocalDb();
      const idx = local.leads.findIndex((l: any) => l.id === leadId);
      if (idx === -1) throw new Error("Invalid, expired, or already used call request token.");

      const lead = local.leads[idx];
      const now = new Date();

      if (
        lead.call_token !== callToken ||
        lead.call_token_used ||
        (lead.call_token_expires_at && now > new Date(lead.call_token_expires_at))
      ) {
        throw new Error("Invalid, expired, or already used call request token.");
      }

      // Atomic mutation
      local.leads[idx].call_opted_in = true;
      local.leads[idx].status = "call_opted_in";
      local.leads[idx].call_token_used = true;
      local.leads[idx].updated_at = now.toISOString();
      syncMockAnalyticsAndScoring(local, leadId);

      local.activity_log.unshift({
        id: `act-${Date.now()}`,
        message: `Call requested via single-use token for lead: ${lead.name}`,
        timestamp: now.toISOString(),
      });

      writeLocalDb(local);
      return { success: true, message: "Call request received" };
    }
  },

  async updateLeadNotes(id: string, notes: string): Promise<Lead> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin!
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
      const { error } = await supabaseAdmin!.from("leads").delete().eq("id", id);
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

  // LEAD ACTIVITIES & WORKSPACE TIMELINE
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    } else {
      const local = readLocalDb();
      if (!local.lead_activities) local.lead_activities = [];
      return local.lead_activities.filter((a: any) => a.lead_id === leadId);
    }
  },

  async addLeadActivity(leadId: string, activityType: string, description: string, actor: string = "admin", metadata: any = {}): Promise<LeadActivity> {
    const entry: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: leadId,
      activity_type: activityType,
      description,
      actor,
      metadata,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("lead_activities")
        .insert([entry])
        .select()
        .single();
      if (error) return entry;
      return data || entry;
    } else {
      const local = readLocalDb();
      if (!local.lead_activities) local.lead_activities = [];
      local.lead_activities.unshift(entry);
      writeLocalDb(local);
      return entry;
    }
  },

  async updateLeadQualification(
    leadId: string,
    qualificationData: {
      status?: string;
      lead_score?: number;
      budget_signal?: string;
      internal_notes?: string;
      lead_score_manual_override?: boolean;
      lead_score_override_reason?: string;
    },
    actor: string = "admin"
  ): Promise<Lead> {
    const existing = await this.getLead(leadId);
    if (!existing) throw new Error("Lead not found");

    const updates: Partial<Lead> = {
      ...qualificationData,
      updated_at: new Date().toISOString(),
    };

    // Explicit score change sets override to true.
    if (qualificationData.lead_score !== undefined && qualificationData.lead_score_manual_override === undefined) {
      updates.lead_score_manual_override = true;
    }

    let updatedLead: Lead;
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();
      if (error) throw error;
      updatedLead = data;
    } else {
      const local = readLocalDb();
      const idx = local.leads.findIndex((l: any) => l.id === leadId);
      if (idx === -1) throw new Error("Lead not found");
      local.leads[idx] = { ...local.leads[idx], ...updates };
      syncMockAnalyticsAndScoring(
        local, 
        leadId, 
        updates.lead_score, 
        updates.lead_score_manual_override, 
        updates.lead_score_override_reason
      );
      writeLocalDb(local);
      updatedLead = local.leads[idx];
    }

    // Record timeline activity
    const changes: string[] = [];
    if (qualificationData.status && qualificationData.status !== existing.status) {
      changes.push(`Status: ${existing.status} → ${qualificationData.status}`);
    }
    if (qualificationData.lead_score !== undefined && qualificationData.lead_score !== existing.lead_score) {
      changes.push(`Score: ${existing.lead_score || 0} → ${qualificationData.lead_score}`);
    }
    if (qualificationData.budget_signal && qualificationData.budget_signal !== existing.budget_signal) {
      changes.push(`Budget: ${qualificationData.budget_signal}`);
    }

    const desc = changes.length > 0 ? `Updated lead qualification (${changes.join(", ")})` : "Updated internal notes";
    await this.addLeadActivity(leadId, qualificationData.status !== existing.status ? "status_changed" : "qualification_updated", desc, actor, updates);

    return updatedLead;
  },

  // BLOG POSTS CRUD
  async getPosts(): Promise<BlogPost[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin!
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
      const { data, error } = await supabaseAdmin!
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
        const { data, error } = await supabaseAdmin!
          .from("posts")
          .update({ ...postData, updated_at: new Date().toISOString() })
          .eq("id", postData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseAdmin!
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
      const { error } = await supabaseAdmin!.from("posts").delete().eq("id", id);
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
      const { data, error } = await supabaseAdmin!
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
      const { data, error } = await supabaseAdmin!
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
        const { data, error } = await supabaseAdmin!
          .from("projects")
          .update({ ...projData, updated_at: new Date().toISOString() })
          .eq("id", projData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseAdmin!
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
      const { error } = await supabaseAdmin!.from("projects").delete().eq("id", id);
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
      const { data, error } = await supabaseAdmin!
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
      const { data, error } = await supabaseAdmin!
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
        const { data, error } = await supabaseAdmin!
          .from("roles")
          .update({ ...roleData, updated_at: new Date().toISOString() })
          .eq("id", roleData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseAdmin!
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
      const { error } = await supabaseAdmin!.from("roles").delete().eq("id", id);
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
      const { data, error } = await supabaseAdmin!.from("site_content").select("key, value");
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
      const { data, error } = await supabaseAdmin!.from("site_content").select("*");
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return local.site_content;
    }
  },

  async saveSiteContent(key: string, value: string): Promise<boolean> {
    if (isSupabaseEnabled) {
      const { error } = await supabaseAdmin!
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
      const { data, error } = await supabaseAdmin!
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
        const { data, error } = await supabaseAdmin!
          .from("faq_items")
          .update({ ...faqData, updated_at: new Date().toISOString() })
          .eq("id", faqData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseAdmin!
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
      const { error } = await supabaseAdmin!.from("faq_items").delete().eq("id", id);
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
      const { data, error } = await supabaseAdmin!
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
        const { data, error } = await supabaseAdmin!
          .from("testimonials")
          .update({ ...testData, updated_at: new Date().toISOString() })
          .eq("id", testData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseAdmin!
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
      const { error } = await supabaseAdmin!.from("testimonials").delete().eq("id", id);
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
      const { data, error } = await supabaseAdmin!
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
        const { data, error } = await supabaseAdmin!
          .from("services")
          .update({ ...serviceData, updated_at: new Date().toISOString() })
          .eq("id", serviceData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabaseAdmin!
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
    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin.from("services").delete().eq("id", id);
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

  async getDashboardMetrics(startDate?: string, endDate?: string): Promise<any> {
    const { start, end } = parseDateRange(startDate, endDate);
    const duration = end.getTime() - start.getTime();
    const priorStart = new Date(start.getTime() - duration);

    const now = new Date();
    const rolling90DaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const fetchStart = priorStart < rolling90DaysAgo ? priorStart : rolling90DaysAgo;

    let leads: any[] = [];
    let allLeads: any[] = [];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (isSupabaseEnabled && supabaseAdmin) {
      const [leadsRes, allLeadsCountsRes] = await Promise.all([
        supabaseAdmin.from("leads").select("created_at, status, lead_score, budget_signal, budget_level, source, utm_source").gte("created_at", fetchStart.toISOString()).lte("created_at", end.toISOString()),
        supabaseAdmin.from("leads").select("created_at")
      ]);
      leads = leadsRes.data || [];
      allLeads = allLeadsCountsRes.data || [];
    } else {
      const local = readLocalDb();
      allLeads = local.leads || [];
      leads = allLeads.filter((l: any) => {
        const d = new Date(l.created_at);
        return d >= fetchStart && d <= end;
      });
    }

    const leadsToday = allLeads.filter((l: any) => new Date(l.created_at) >= startOfToday).length;
    const leadsThisMonth = allLeads.filter((l: any) => new Date(l.created_at) >= startOfMonth).length;

    const currentLeads = leads.filter((l: any) => {
      const d = new Date(l.created_at);
      return d >= start && d <= end;
    });
    const priorLeads = leads.filter((l: any) => {
      const d = new Date(l.created_at);
      return d >= priorStart && d < start;
    });

    const totalLeads = currentLeads.length;
    const qualifiedLeads = currentLeads.filter((l: any) => l.status === "qualified").length;
    const wonDeals = currentLeads.filter((l: any) => l.status === "won").length;
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

    let scoreSum = 0;
    let scoredCount = 0;
    currentLeads.forEach((l: any) => {
      if (l.lead_score !== undefined && l.lead_score !== null) {
        scoreSum += l.lead_score;
        scoredCount++;
      }
    });
    const averageLeadScore = scoredCount > 0 ? scoreSum / scoredCount : 0;

    let wonRevenue = 0;
    let weightedPipeline = 0;
    currentLeads.forEach((l: any) => {
      const val = getEstimatedDealValue(l);
      if (l.status === 'won') {
        wonRevenue += val;
      } else if (l.status !== 'lost' && l.status !== 'archived') {
        let weight = 0.1;
        if (l.status === 'proposal_sent') weight = 0.8;
        else if (l.status === 'qualified') weight = 0.5;
        else if (l.status === 'call_opted_in' || l.call_opted_in) weight = 0.2;
        weightedPipeline += val * weight;
      }
    });
    const projectedRevenue = wonRevenue + weightedPipeline;

    const priorTotal = priorLeads.length;
    const priorWon = priorLeads.filter((l: any) => l.status === "won").length;
    const priorConversion = priorTotal > 0 ? (priorWon / priorTotal) * 100 : 0;

    let priorScoreSum = 0;
    let priorScoredCount = 0;
    priorLeads.forEach((l: any) => {
      if (l.lead_score !== undefined && l.lead_score !== null) {
        priorScoreSum += l.lead_score;
        priorScoredCount++;
      }
    });
    const priorAvgLeadScore = priorScoredCount > 0 ? priorScoreSum / priorScoredCount : 0;

    let priorWonRevenue = 0;
    let priorWeightedPipeline = 0;
    priorLeads.forEach((l: any) => {
      const val = getEstimatedDealValue(l);
      if (l.status === 'won') {
        priorWonRevenue += val;
      } else if (l.status !== 'lost' && l.status !== 'archived') {
        let weight = 0.1;
        if (l.status === 'proposal_sent') weight = 0.8;
        else if (l.status === 'qualified') weight = 0.5;
        else if (l.status === 'call_opted_in' || l.call_opted_in) weight = 0.2;
        priorWeightedPipeline += val * weight;
      }
    });
    const priorProjected = priorWonRevenue + priorWeightedPipeline;

    const sources: Record<string, number> = {};
    currentLeads.forEach((l: any) => {
      const src = l.source || "direct";
      sources[src] = (sources[src] || 0) + 1;
    });

    const sourcePerformance = Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Score Distribution Calculations
    const scoreBreakdown = [
      { name: "Priority", min: 90, max: 100, count: 0, scoreSum: 0, color: "#2C4BFF" },
      { name: "Hot", min: 70, max: 89, count: 0, scoreSum: 0, color: "#E2603A" },
      { name: "Warm", min: 40, max: 69, count: 0, scoreSum: 0, color: "#FFA500" },
      { name: "Cold", min: 0, max: 39, count: 0, scoreSum: 0, color: "#9B9B9B" }
    ];

    let totalScored = 0;
    currentLeads.forEach((l: any) => {
      const score = l.lead_score || 0;
      totalScored++;
      const range = scoreBreakdown.find(r => score >= r.min && score <= r.max);
      if (range) {
        range.count++;
        range.scoreSum += score;
      }
    });

    const scoresBreakdown = scoreBreakdown.map(r => ({
      name: r.name,
      value: r.count,
      percentage: totalScored > 0 ? Number(((r.count / totalScored) * 100).toFixed(1)) : 0,
      avgScore: r.count > 0 ? Number((r.scoreSum / r.count).toFixed(1)) : 0,
      color: r.color
    }));

    // Multi-period Revenue Intelligence (Current month, prior month, rolling 30, rolling 90)
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPriorMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPriorMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const getMetricsForSubgroup = (subLeads: any[]) => {
      let won = 0;
      let totalPipeline = 0;
      let activeOpps = 0;
      let dealValueSum = 0;

      subLeads.forEach(l => {
        if (l.status !== 'lost' && l.status !== 'archived') {
          activeOpps++;
          const val = getEstimatedDealValue(l);
          dealValueSum += val;

          if (l.status === 'won') {
            won += val;
          } else {
            let weight = 0.1;
            if (l.status === 'proposal_sent') weight = 0.8;
            else if (l.status === 'qualified') weight = 0.5;
            else if (l.status === 'call_opted_in' || l.call_opted_in) weight = 0.2;
            totalPipeline += val * weight;
          }
        }
      });

      return {
        wonRevenue: won,
        weightedPipeline: totalPipeline,
        projectedRevenue: won + totalPipeline,
        opportunities: activeOpps,
        avgDealValue: activeOpps > 0 ? Math.round(dealValueSum / activeOpps) : 0
      };
    };

    const currentMonthLeads = leads.filter(l => new Date(l.created_at) >= startOfCurrentMonth);
    const priorMonthLeads = leads.filter(l => {
      const d = new Date(l.created_at);
      return d >= startOfPriorMonth && d <= endOfPriorMonth;
    });
    const rolling30Leads = leads.filter(l => new Date(l.created_at) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    const rolling90Leads = leads.filter(l => new Date(l.created_at) >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));

    const revenueIntelligence = {
      currentMonth: getMetricsForSubgroup(currentMonthLeads),
      priorMonth: getMetricsForSubgroup(priorMonthLeads),
      rolling30: getMetricsForSubgroup(rolling30Leads),
      rolling90: getMetricsForSubgroup(rolling90Leads)
    };

    return {
      totalLeads,
      leadsToday,
      leadsThisMonth,
      qualifiedLeads,
      wonDeals,
      conversionRate: Number(conversionRate.toFixed(2)),
      averageLeadScore: Number(averageLeadScore.toFixed(1)),
      projectedRevenue: Math.round(projectedRevenue),
      wonRevenue: Math.round(wonRevenue),
      weightedPipeline: Math.round(weightedPipeline),
      comparisons: {
        totalLeads: priorTotal,
        conversionRate: Number(priorConversion.toFixed(2)),
        averageLeadScore: Number(priorAvgLeadScore.toFixed(1)),
        projectedRevenue: Math.round(priorProjected),
        wonRevenue: Math.round(priorWonRevenue)
      },
      sourcePerformance,
      scoresBreakdown,
      revenueIntelligence,
      forecastModel: {
        method: "Deterministic Weighted Pipeline",
        weights: { won: 1.0, proposal_sent: 0.8, qualified: 0.5, call_opted_in: 0.2, new: 0.1 },
        explanation: "Projected Revenue = Won Revenue (100% value) + Weighted Pipeline (sum of value * weight)."
      }
    };
  },

  async getLeadFunnel(startDate?: string, endDate?: string): Promise<any> {
    const { start, end } = parseDateRange(startDate, endDate);
    
    let events: any[] = [];
    let leads: any[] = [];

    if (isSupabaseEnabled && supabaseAdmin) {
      try {
        const [eventsRes, leadsRes] = await Promise.all([
          supabaseAdmin.from("analytics_events").select("*").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()).order("created_at", { ascending: true }),
          supabaseAdmin.from("leads").select("created_at, status, call_opted_in, call_attempted_at, meeting_datetime, outcome_at").gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
        ]);
        events = eventsRes.data || [];
        leads = leadsRes.data || [];
      } catch (err) {
        console.error("Supabase error fetching lead funnel events:", err);
      }
    } else {
      const local = readLocalDb();
      events = (local.analytics_events || []).filter((e: any) => {
        const d = new Date(e.created_at);
        return d >= start && d <= end;
      });
      leads = (local.leads || []).filter((l: any) => {
        const d = new Date(l.created_at);
        return d >= start && d <= end;
      });
    }

    const funnelStages = ['new_lead', 'call_requested', 'qualified', 'proposal_sent', 'won'];
    const stageCounts = {
      new_lead: 0,
      call_requested: 0,
      qualified: 0,
      proposal_sent: 0,
      won: 0,
      lost: 0
    };

    leads.forEach((l: any) => {
      stageCounts.new_lead++;
      if (l.call_opted_in || ['call_opted_in', 'qualified', 'proposal_sent', 'won', 'lost'].includes(l.status)) {
        stageCounts.call_requested++;
      }
      if (['qualified', 'proposal_sent', 'won'].includes(l.status)) {
        stageCounts.qualified++;
      }
      if (['proposal_sent', 'won'].includes(l.status)) {
        stageCounts.proposal_sent++;
      }
      if (l.status === 'won') {
        stageCounts.won++;
      }
      if (l.status === 'lost') {
        stageCounts.lost++;
      }
    });

    const leadTransitions: Record<string, Record<string, string>> = {};
    events.forEach((evt: any) => {
      if (!leadTransitions[evt.lead_id]) {
        leadTransitions[evt.lead_id] = {};
      }
      leadTransitions[evt.lead_id][evt.event_type] = evt.created_at;
    });

    const transitionTimes: Record<string, number[]> = {
      'new_lead->call_requested': [],
      'call_requested->qualified': [],
      'qualified->proposal_sent': [],
      'proposal_sent->won': []
    };

    Object.values(leadTransitions).forEach((times) => {
      if (times.new_lead && times.call_requested) {
        transitionTimes['new_lead->call_requested'].push(
          new Date(times.call_requested).getTime() - new Date(times.new_lead).getTime()
        );
      }
      if (times.call_requested && times.qualified) {
        transitionTimes['call_requested->qualified'].push(
          new Date(times.qualified).getTime() - new Date(times.call_requested).getTime()
        );
      }
      if (times.qualified && times.proposal_sent) {
        transitionTimes['qualified->proposal_sent'].push(
          new Date(times.proposal_sent).getTime() - new Date(times.qualified).getTime()
        );
      }
      if (times.proposal_sent && times.won) {
        transitionTimes['proposal_sent->won'].push(
          new Date(times.won).getTime() - new Date(times.proposal_sent).getTime()
        );
      }
    });

    if (events.length === 0) {
      leads.forEach((l: any) => {
        const createTime = new Date(l.created_at).getTime();
        if (l.call_attempted_at) {
          const callTime = new Date(l.call_attempted_at).getTime();
          if (callTime > createTime) transitionTimes['new_lead->call_requested'].push(callTime - createTime);
        }
        if (l.call_attempted_at && l.meeting_datetime) {
          const callTime = new Date(l.call_attempted_at).getTime();
          const meetTime = new Date(l.meeting_datetime).getTime();
          if (meetTime > callTime) transitionTimes['call_requested->qualified'].push(meetTime - callTime);
        }
        if (l.meeting_datetime && l.outcome_at && l.status === 'won') {
          const meetTime = new Date(l.meeting_datetime).getTime();
          const outcomeTime = new Date(l.outcome_at).getTime();
          if (outcomeTime > meetTime) transitionTimes['proposal_sent->won'].push(outcomeTime - meetTime);
        }
      });
    }

    const avgTransitionTimes: Record<string, number> = {};
    Object.entries(transitionTimes).forEach(([key, list]) => {
      if (list.length > 0) {
        const sum = list.reduce((a, b) => a + b, 0);
        avgTransitionTimes[key] = Number((sum / list.length / 1000 / 3600).toFixed(1));
      } else {
        const fallbacks: Record<string, number> = {
          'new_lead->call_requested': 1.5,
          'call_requested->qualified': 4.2,
          'qualified->proposal_sent': 8.0,
          'proposal_sent->won': 24.5
        };
        avgTransitionTimes[key] = fallbacks[key];
      }
    });

    const stagesData = funnelStages.map((stage, idx) => {
      const count = stageCounts[stage as keyof typeof stageCounts] || 0;
      const prevStage = idx > 0 ? funnelStages[idx - 1] : null;
      const prevCount = prevStage ? (stageCounts[prevStage as keyof typeof stageCounts] || 0) : 0;

      const dropOffRate = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;

      return {
        stage: stage.replace("_", " "),
        count,
        dropOffRate: Number(dropOffRate.toFixed(1))
      };
    });

    return {
      stages: stagesData,
      averageTimes: avgTransitionTimes,
      dropOffs: {
        totalLeads: stageCounts.new_lead,
        conversionRate: stageCounts.new_lead > 0 ? Number(((stageCounts.won / stageCounts.new_lead) * 100).toFixed(1)) : 0
      }
    };
  },

  async getRevenueForecast(startDate?: string, endDate?: string): Promise<any> {
    const { start, end } = parseDateRange(startDate, endDate);
    let leads: any[] = [];
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data } = await supabaseAdmin.from("leads").select("created_at, status, budget_signal, budget_level").gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
      leads = data || [];
    } else {
      const local = readLocalDb();
      leads = (local.leads || []).filter((l: any) => {
        const d = new Date(l.created_at);
        return d >= start && d <= end;
      });
    }

    const monthlyGroups: Record<string, { won: number; pipeline: number }> = {};
    
    let curr = new Date(start.getFullYear(), start.getMonth(), 1);
    while (curr <= end) {
      const mStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
      monthlyGroups[mStr] = { won: 0, pipeline: 0 };
      curr.setMonth(curr.getMonth() + 1);
    }

    leads.forEach((l: any) => {
      const d = new Date(l.created_at);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyGroups[mStr]) {
        monthlyGroups[mStr] = { won: 0, pipeline: 0 };
      }

      const val = getEstimatedDealValue(l);
      if (l.status === 'won') {
        monthlyGroups[mStr].won += val;
      } else {
        let weight = 0.1;
        if (l.status === 'proposal_sent') weight = 0.8;
        else if (l.status === 'qualified') weight = 0.5;
        else if (l.status === 'call_opted_in' || l.call_opted_in) weight = 0.2;
        monthlyGroups[mStr].pipeline += val * weight;
      }
    });

    const forecastData = Object.entries(monthlyGroups)
      .map(([month, val]) => ({
        month,
        won: Math.round(val.won),
        pipeline: Math.round(val.pipeline),
        total: Math.round(val.won + val.pipeline)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return forecastData;
  },

  async getLeadSourceMetrics(startDate?: string, endDate?: string): Promise<any> {
    const { start, end } = parseDateRange(startDate, endDate);
    let leads: any[] = [];
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data } = await supabaseAdmin.from("leads").select("source, status, budget_signal, budget_level").gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
      leads = data || [];
    } else {
      const local = readLocalDb();
      leads = (local.leads || []).filter((l: any) => {
        const d = new Date(l.created_at);
        return d >= start && d <= end;
      });
    }

    const sourceData: Record<string, { total: number; qualified: number; won: number; revenue: number; projected: number }> = {};

    const standardSources = ['direct', 'google', 'linkedin', 'referral', 'newsletter'];
    standardSources.forEach((src) => {
      sourceData[src] = { total: 0, qualified: 0, won: 0, revenue: 0, projected: 0 };
    });

    leads.forEach((l: any) => {
      let src = l.source || "direct";
      if (src.includes("google")) src = "google";
      else if (src.includes("linkedin")) src = "linkedin";
      else if (src.includes("referral")) src = "referral";
      else if (src.includes("newsletter")) src = "newsletter";
      
      if (!sourceData[src]) {
        sourceData[src] = { total: 0, qualified: 0, won: 0, revenue: 0, projected: 0 };
      }

      const val = getEstimatedDealValue(l);
      sourceData[src].total++;
      if (['qualified', 'proposal_sent', 'won'].includes(l.status)) {
        sourceData[src].qualified++;
      }
      if (l.status === 'won') {
        sourceData[src].won++;
        sourceData[src].revenue += val;
      } else {
        let weight = 0.1;
        if (l.status === 'proposal_sent') weight = 0.8;
        else if (l.status === 'qualified') weight = 0.5;
        else if (l.status === 'call_opted_in' || l.call_opted_in) weight = 0.2;
        sourceData[src].projected += val * weight;
      }
    });

    const metricsList = Object.entries(sourceData).map(([source, stats]) => {
      const conversionRate = stats.total > 0 ? (stats.won / stats.total) * 100 : 0;
      return {
        source: source.replace("_", " "),
        total: stats.total,
        qualified: stats.qualified,
        won: stats.won,
        conversionRate: Number(conversionRate.toFixed(1)),
        revenue: stats.revenue,
        projectedRevenue: Math.round(stats.revenue + stats.projected)
      };
    }).sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate;
      return b.total - a.total;
    });

    return metricsList;
  },

  async getLeadsCountInWindow(startDate: string, endDate: string): Promise<number> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { count, error } = await supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      if (error) throw error;
      return count || 0;
    } else {
      const local = readLocalDb();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return (local.leads || []).filter((l: any) => {
        const d = new Date(l.created_at);
        return d >= start && d <= end;
      }).length;
    }
  },

  async getLeadTrendMetrics(startDate?: string, endDate?: string): Promise<any[]> {
    const { start, end } = parseDateRange(startDate, endDate);
    
    if (isSupabaseEnabled && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("daily_metrics")
          .select("*")
          .gte("date", start.toISOString().split("T")[0])
          .lte("date", end.toISOString().split("T")[0])
          .order("date", { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          return data.map((d: any) => ({
            date: d.date,
            leads: d.total_leads,
            qualified: d.qualified_leads,
            won: d.won_deals,
            conversionRate: d.conversion_rate,
            revenue: d.projected_revenue
          }));
        }
      } catch (err) {
        console.error("Failed to query daily_metrics for trend:", err);
      }
    }

    let leads: any[] = [];
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("leads")
        .select("created_at, status, budget_signal, budget_level")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
      leads = data || [];
    } else {
      const local = readLocalDb();
      leads = (local.leads || []).filter((l: any) => {
        const d = new Date(l.created_at);
        return d >= start && d <= end;
      });
    }

    const dateGroups: Record<string, { leads: number; qualified: number; won: number; revenue: number }> = {};
    
    let curr = new Date(start);
    while (curr <= end) {
      const dateStr = curr.toISOString().split("T")[0];
      dateGroups[dateStr] = { leads: 0, qualified: 0, won: 0, revenue: 0 };
      curr.setDate(curr.getDate() + 1);
    }

    leads.forEach((l: any) => {
      const dateStr = l.created_at.split("T")[0];
      if (!dateGroups[dateStr]) {
        dateGroups[dateStr] = { leads: 0, qualified: 0, won: 0, revenue: 0 };
      }
      dateGroups[dateStr].leads++;
      if (['qualified', 'proposal_sent', 'won'].includes(l.status)) dateGroups[dateStr].qualified++;
      if (l.status === 'won') {
        dateGroups[dateStr].won++;
        dateGroups[dateStr].revenue += getEstimatedDealValue(l);
      }
    });

    const trendData = Object.entries(dateGroups).map(([date, stats]) => {
      const conversionRate = stats.leads > 0 ? (stats.won / stats.leads) * 100 : 0;
      return {
        date,
        leads: stats.leads,
        qualified: stats.qualified,
        won: stats.won,
        conversionRate: Number(conversionRate.toFixed(1)),
        revenue: stats.revenue
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return trendData;
  },

  async getDashboardAlerts(): Promise<any[]> {
    try {
      const { getSystemMetrics } = await import("./monitoring");
      const { evaluateAlertTriggers } = await import("./alerting");

      const systemMetrics = await getSystemMetrics();
      const res = await evaluateAlertTriggers({
        dbDownDurationSeconds: 0,
        webhookFailuresIn15Min: systemMetrics.totalWebhookFailures,
        criticalErrorsIn15Min: systemMetrics.totalErrors,
        rateLimitBreachesIn15Min: systemMetrics.totalBreaches,
        includeBusinessRules: true,
      });

      return res.triggeredAlerts.map((name) => {
        let severity: "warning" | "critical" = "warning";
        let message = "";
        
        if (name.includes("Conversion")) {
          message = "funnel conversion rate fell below 15%";
        } else if (name.includes("Volume")) {
          message = "lead registration volume fell by over 50% week-over-week";
        } else if (name.includes("Abandonment")) {
          message = "funnel abandonment at proposal stage exceeds 80%";
        } else if (name.includes("Exceptions") || name.includes("Exceptions Alert")) {
          severity = "critical";
          message = `critical system exceptions logged: ${systemMetrics.totalErrors}`;
        } else if (name.includes("Webhook")) {
          message = `webhook failures threshold breached: ${systemMetrics.totalWebhookFailures}`;
        } else if (name.includes("Rate")) {
          message = `large rate-limit breaches burst detected: ${systemMetrics.totalBreaches}`;
        } else if (name.includes("Database")) {
          severity = "critical";
          message = "database connection failure";
        } else {
          message = "system warning alert triggered";
        }

        return {
          title: name,
          severity,
          message,
          time: new Date().toISOString(),
          status: "Active"
        };
      });
    } catch (err) {
      console.error("Failed to query dashboard alerts:", err);
      return [];
    }
  },

  async runDailyCronJobs(): Promise<{ success: boolean; report?: string; alertsTriggered?: string[] }> {
    const executedAt = new Date().toISOString();
    
    // 1. Log Retention Cleanup
    const { runLogCleanupJob } = await import("./log-retention");
    const cleanupSummary = await runLogCleanupJob();
    
    // 2. Metrics Aggregation
    let aggregateResult: any = { success: true };
    if (isSupabaseEnabled && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc("aggregate_daily_metrics");
        if (error) throw error;
        aggregateResult = data;
      } catch (err) {
        console.error("Supabase daily aggregate RPC error:", err);
      }
    } else {
      const local = readLocalDb();
      if (!local.daily_metrics) local.daily_metrics = [];
      const todayStr = new Date().toISOString().split("T")[0];
      
      const leads = local.leads || [];
      const total_leads = leads.filter((l: any) => l.created_at.startsWith(todayStr)).length;
      const qualified_leads = leads.filter((l: any) => l.created_at.startsWith(todayStr) && l.status === "qualified").length;
      const won_deals = leads.filter((l: any) => l.created_at.startsWith(todayStr) && l.status === "won").length;
      const conversion_rate = total_leads > 0 ? (won_deals / total_leads) * 100 : 0;
      
      let projected_revenue = 0;
      leads.filter((l: any) => l.created_at.startsWith(todayStr)).forEach((l: any) => {
        if (l.status === "won") projected_revenue += 100000;
        else if (l.status === "proposal_sent") projected_revenue += 60000;
        else if (l.status === "qualified") projected_revenue += 30000;
      });
      
      const metricsEntry = {
        id: `met-${Date.now()}`,
        date: todayStr,
        total_leads,
        qualified_leads,
        won_deals,
        conversion_rate,
        projected_revenue,
        created_at: executedAt
      };
      
      const existingIdx = local.daily_metrics.findIndex((d: any) => d.date === todayStr);
      if (existingIdx !== -1) {
        local.daily_metrics[existingIdx] = metricsEntry;
      } else {
        local.daily_metrics.push(metricsEntry);
      }
      writeLocalDb(local);
    }
    
    // 3. Evaluate Alerts
    const { evaluateAlertTriggers } = await import("./alerting");
    const alertsRes = await evaluateAlertTriggers();
    
    // 4. Generate Daily Executive Report
    const dashboardStats = await this.getDashboardMetrics();
    
    const leadsToday = dashboardStats.leadsToday;
    const leadsMonth = dashboardStats.leadsThisMonth;
    const conversionRate = dashboardStats.conversionRate;
    const qualifiedLeads = dashboardStats.qualifiedLeads;
    const revenueProjection = dashboardStats.revenueProjection;
    
    const topSourcesText = dashboardStats.sourcePerformance
      .slice(0, 3)
      .map((s: any) => `  - ${s.source}: ${s.count} leads`)
      .join("\n") || "  - No source data recorded yet.";
      
    const systemHealth = isSupabaseEnabled ? "Healthy (Supabase Connected)" : "Healthy (Mock Mode Active)";
    
    const reportText = `
=========================================
DAILY EXECUTIVE REPORT — ${new Date().toLocaleDateString()}
=========================================
SUMMARY METRICS:
- Leads Captured Today: ${leadsToday}
- Leads Captured This Month: ${leadsMonth}
- Overall Conversion Rate: ${conversionRate}%
- Active Qualified Leads: ${qualifiedLeads}
- Total Revenue Forecast: ₹${revenueProjection.toLocaleString()}

TOP ACQUISITION SOURCES:
${topSourcesText}

SYSTEM ENVIRONMENT & HEALTH:
- System Status: ${systemHealth}
- Log Cleanup Status: Success
- Logs Purged: ${cleanupSummary.rateLimitDeleted + cleanupSummary.webhookDeleted + cleanupSummary.errorDeleted} entries cleared
- Execution Timestamp: ${executedAt}
=========================================
`;

    // Record timeline activity logs
    await this.addActivityLog(`Daily Executive Report generated: ${leadsToday} leads today, ${conversionRate}% conversion.`);
    
    // Send via email if Resend key exists
    if (process.env.RESEND_API_KEY) {
      try {
        const settings = await this.getSettings();
        const toEmail = settings.notification_email || "admin@houseofworkflow.com";
        
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: "AxonFlow Reports <reports@houseofworkflow.com>",
            to: toEmail,
            subject: `Daily Executive Report — ${new Date().toLocaleDateString()}`,
            html: `<pre style="font-family: monospace; font-size: 13px; line-height: 1.5; background: #faf9f6; padding: 20px; border-radius: 8px; border: 1px solid #e5e4e0; color: #0d0d0d;">${reportText}</pre>`
          })
        });
      } catch (err) {
        console.error("Resend report email dispatch failed:", err);
      }
    }
    
    return {
      success: true,
      report: reportText,
      alertsTriggered: alertsRes.triggeredAlerts
    };
  },

  async checkCommunicationIdempotency(key: string): Promise<boolean> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("communication_logs")
        .select("id")
        .eq("idempotency_key", key)
        .in("status", ["sent", "queued", "delivered"]);
      if (error) throw error;
      return data && data.length > 0;
    } else {
      const local = readLocalDb();
      return (local.communication_logs || []).some(
        (log: any) => log.idempotency_key === key && ["sent", "queued", "delivered"].includes(log.status)
      );
    }
  },

  async saveCommunicationLog(
    leadId: string,
    channel: string,
    provider: string,
    templateName: string | undefined,
    messageType: string,
    providerMessageId: string | undefined,
    status: string,
    errorMessage: string | undefined,
    idempotencyKey: string
  ): Promise<void> {
    const logEntry = {
      id: `cml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: leadId,
      channel,
      provider,
      template_name: templateName || null,
      message_type: messageType,
      provider_message_id: providerMessageId || null,
      status,
      error_message: errorMessage || null,
      idempotency_key: idempotencyKey,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      failed_at: status === "failed" ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("communication_logs")
        .upsert([logEntry], { onConflict: "idempotency_key" });
      if (error) throw error;
    } else {
      const local = readLocalDb();
      if (!local.communication_logs) local.communication_logs = [];
      const idx = local.communication_logs.findIndex((l: any) => l.idempotency_key === idempotencyKey);
      if (idx !== -1) {
        local.communication_logs[idx] = { ...local.communication_logs[idx], ...logEntry };
      } else {
        local.communication_logs.push(logEntry);
      }
      writeLocalDb(local);
    }
  },

  async getCommunicationLogsByLead(leadId: string): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("communication_logs")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const local = readLocalDb();
      return (local.communication_logs || [])
        .filter((log: any) => log.lead_id === leadId)
        .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
    }
  },

  async saveWebhookEvent(
    provider: string,
    eventType: string,
    providerEventId: string,
    payload: any
  ): Promise<any> {
    const entry = {
      id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider,
      event_type: eventType,
      provider_event_id: providerEventId,
      payload_hash: null,
      received_at: new Date().toISOString(),
      processed: false,
      processed_at: null,
      lead_id: null,
      workflow_triggered: "flow_a",
      error_message: null
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("webhook_events")
        .insert([entry])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const local = readLocalDb();
      if (!local.webhook_events) local.webhook_events = [];
      local.webhook_events.push(entry);
      writeLocalDb(local);
      return entry;
    }
  },

  async checkWebhookProcessed(provider: string, providerEventId: string): Promise<boolean> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("webhook_events")
        .select("processed")
        .eq("provider", provider)
        .eq("provider_event_id", providerEventId)
        .eq("processed", true);
      if (error) return false;
      return data && data.length > 0;
    } else {
      const local = readLocalDb();
      return (local.webhook_events || []).some(
        (e: any) => e.provider === provider && e.provider_event_id === providerEventId && e.processed === true
      );
    }
  },

  async markWebhookProcessed(id: string, leadId?: string): Promise<void> {
    const nowStr = new Date().toISOString();

    if (isSupabaseEnabled && supabaseAdmin) {
      const { error: wfError } = await supabaseAdmin
        .from("workflow_events")
        .update({
          status: "processed",
          processed_at: nowStr,
        })
        .eq("event_id", id);

      if (wfError && wfError.code === "PGRST205") {
        await supabaseAdmin
          .from("webhook_events")
          .update({
            processed: true,
            processed_at: nowStr,
            lead_id: leadId || null,
          })
          .eq("id", id);
      }
    } else {
      const local = readLocalDb();
      if (!local.webhook_events) local.webhook_events = [];
      const idx = local.webhook_events.findIndex((e: any) => e.id === id || e.provider_event_id === id);
      if (idx !== -1) {
        local.webhook_events[idx] = { ...local.webhook_events[idx], processed: true, processed_at: nowStr, lead_id: leadId || null };
        writeLocalDb(local);
      }
    }
  },

  async claimWebhookEvent(
    provider: string,
    providerEventId: string,
    eventType: string,
    payload: any
  ): Promise<'processed' | 'in_flight' | 'claimed'> {
    const nowStr = new Date().toISOString();

    if (isSupabaseEnabled && supabaseAdmin) {
      const sourceVal = provider === "calcom" ? "cal.com" : provider;

      const { data: existing, error: selectError } = await supabaseAdmin
        .from("workflow_events")
        .select("*")
        .eq("source", sourceVal)
        .eq("event_id", providerEventId);

      if (!selectError && existing && existing.length > 0) {
        const event = existing[0];
        if (event.status === "processed") {
          return "processed";
        }

        const createdAt = new Date(event.created_at || nowStr).getTime();
        const ageSec = (Date.now() - createdAt) / 1000;
        if (ageSec < 30) {
          return "in_flight";
        }

        await supabaseAdmin
          .from("workflow_events")
          .update({ status: "processing", created_at: nowStr })
          .eq("id", event.id);

        return "claimed";
      }

      const entry = {
        event_id: providerEventId,
        source: sourceVal,
        event_type: eventType,
        payload,
        status: "processing",
        attempt_count: 1,
        created_at: nowStr,
      };

      const { error: insertError } = await supabaseAdmin
        .from("workflow_events")
        .insert([entry]);

      if (insertError) {
        if (insertError.code === "23505") {
          const { data: retryData } = await supabaseAdmin
            .from("workflow_events")
            .select("*")
            .eq("source", sourceVal)
            .eq("event_id", providerEventId);
          if (retryData && retryData.length > 0) {
            return retryData[0].status === "processed" ? "processed" : "in_flight";
          }
        }
        throw insertError;
      }

      return "claimed";
    } else {
      const local = readLocalDb();
      if (!local.webhook_events) local.webhook_events = [];

      const existing = local.webhook_events.find(
        (e: any) => e.provider === provider && e.provider_event_id === providerEventId
      );

      if (existing) {
        if (existing.processed) {
          return "processed";
        }
        const receivedAt = new Date(existing.received_at).getTime();
        const ageSec = (Date.now() - receivedAt) / 1000;
        if (ageSec < 30) {
          return "in_flight";
        }
        existing.received_at = nowStr;
        writeLocalDb(local);
        return "claimed";
      }

      const entry = {
        id: `wh-${Date.now()}`,
        provider,
        event_type: eventType,
        provider_event_id: providerEventId,
        payload_hash: null,
        received_at: nowStr,
        processed: false,
        processed_at: null,
        lead_id: null,
        workflow_triggered: "flow_a",
        error_message: null
      };
      local.webhook_events.push(entry);
      writeLocalDb(local);
      return "claimed";
    }
  },

  async claimCommunication(
    key: string,
    leadId: string,
    channel: string,
    provider: string,
    templateName?: string,
    messageType?: string
  ): Promise<'claimed' | 'duplicate'> {
    const nowStr = new Date().toISOString();
    const logEntry = {
      lead_id: leadId,
      channel,
      provider,
      template_name: templateName || null,
      message_type: messageType || null,
      provider_message_id: null,
      status: "sending",
      error_message: null,
      idempotency_key: key,
      created_at: nowStr
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      // Insert with DO NOTHING
      const { error } = await supabaseAdmin
        .from("communication_logs")
        .insert([logEntry]);

      if (!error) {
        return "claimed";
      }

      // Uniqueness violation (duplicate key)
      if (error.code === "23505") {
        // Query existing status
        const { data, error: selectErr } = await supabaseAdmin
          .from("communication_logs")
          .select("id, status")
          .eq("idempotency_key", key);

        if (selectErr) throw selectErr;

        if (data && data.length > 0) {
          const log = data[0];
          if (log.status === "failed") {
            // Atomic update status to sending to reclaim it!
            const { data: updated, error: updateErr } = await supabaseAdmin
              .from("communication_logs")
              .update({ status: "sending", created_at: nowStr })
              .eq("id", log.id)
              .eq("status", "failed")
              .select();
            if (updateErr) throw updateErr;
            if (updated && updated.length > 0) {
              return "claimed";
            }
          }
        }
      }
      return "duplicate";
    } else {
      // Mock Local Mode — synchronous in-memory lock prevents concurrent duplicate claims
      if (_localCommunicationClaimLocks.has(key)) {
        // Another concurrent call has already claimed this key; treat as duplicate
        return "duplicate";
      }

      const local = readLocalDb();
      if (!local.communication_logs) local.communication_logs = [];
      const existing = local.communication_logs.find(
        (l: any) => l.idempotency_key === key
      );

      if (existing) {
        if (existing.status === "failed") {
          // Reclaim a previously failed entry
          _localCommunicationClaimLocks.add(key);
          existing.status = "sending";
          existing.created_at = nowStr;
          writeLocalDb(local);
          // Release lock after a tick so the write is visible
          Promise.resolve().then(() => _localCommunicationClaimLocks.delete(key));
          return "claimed";
        }
        return "duplicate";
      }

      // Synchronously acquire the lock before the async write
      _localCommunicationClaimLocks.add(key);

      const newEntry = {
        id: `cml-${Date.now()}`,
        ...logEntry
      };
      local.communication_logs.push(newEntry);
      writeLocalDb(local);

      // Release the lock after a microtask so concurrent callers see it
      Promise.resolve().then(() => _localCommunicationClaimLocks.delete(key));

      return "claimed";
    }
  },

  async updateCommunicationStatus(
    key: string,
    status: 'sent' | 'failed' | 'skipped' | 'unavailable',
    providerMessageId?: string,
    errorMessage?: string
  ): Promise<void> {
    const nowStr = new Date().toISOString();
    const updates: any = {
      status,
      provider_message_id: providerMessageId || null,
      error_message: errorMessage || null,
      updated_at: nowStr
    };
    if (status === "sent") {
      updates.sent_at = nowStr;
    } else if (status === "failed") {
      updates.failed_at = nowStr;
    }

    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("communication_logs")
        .update(updates)
        .eq("idempotency_key", key);
      if (error) throw error;
    } else {
      const local = readLocalDb();
      if (!local.communication_logs) local.communication_logs = [];
      const idx = local.communication_logs.findIndex(
        (l: any) => l.idempotency_key === key
      );
      if (idx !== -1) {
        local.communication_logs[idx] = { ...local.communication_logs[idx], ...updates };
        writeLocalDb(local);
      }
    }
  },

  async findLeadByIdentity(email: string, phone?: string, calBookingUid?: string): Promise<Lead | null> {
    const normEmail = email.toLowerCase().trim();
    const normPhone = phone ? phone.replace(/[^\d+]/g, "") : "";

    if (isSupabaseEnabled && supabaseAdmin) {
      if (calBookingUid) {
        const { data: uidData } = await supabaseAdmin
          .from("leads")
          .select("*")
          .eq("cal_booking_uid", calBookingUid);
        if (uidData && uidData.length > 0) return uidData[0];
      }

      if (normEmail) {
        const { data: emailData } = await supabaseAdmin
          .from("leads")
          .select("*")
          .eq("email", normEmail);
        if (emailData && emailData.length > 0) return emailData[0];
      }

      if (normPhone) {
        const { data: phoneData } = await supabaseAdmin
          .from("leads")
          .select("*")
          .eq("phone", normPhone);
        if (phoneData && phoneData.length > 0) return phoneData[0];
      }
      return null;
    } else {
      const local = readLocalDb();
      const leads = local.leads || [];

      if (calBookingUid) {
        const matchUid = leads.find((l: any) => l.cal_booking_uid === calBookingUid || l.cal_event_id === calBookingUid);
        if (matchUid) return matchUid;
      }

      if (normEmail) {
        const matchEmail = leads.find((l: any) => l.email && l.email.toLowerCase().trim() === normEmail);
        if (matchEmail) return matchEmail;
      }

      if (normPhone) {
        const matchPhone = leads.find((l: any) => l.phone && l.phone.replace(/[^\d+]/g, "") === normPhone);
        if (matchPhone) return matchPhone;
      }
      return null;
    }
  },

  async upsertMeeting(
    leadId: string,
    calEventId: string,
    scheduledAt: string,
    timezone: string,
    link: string,
    status: string = "scheduled"
  ): Promise<void> {
    const meetingEntry = {
      id: `mtg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: leadId,
      cal_event_id: calEventId,
      cal_uid: calEventId,
      scheduled_at: scheduledAt,
      attendee_timezone: timezone,
      duration_min: 30,
      meeting_link: link,
      status,
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      const nowStr = new Date().toISOString();
      const endTime = new Date(new Date(scheduledAt).getTime() + 30 * 60000).toISOString();

      const { data: existing } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("cal_booking_uid", calEventId);

      const bookingRecord = {
        lead_id: leadId,
        cal_booking_uid: calEventId,
        title: "House Of Workflow Discovery Call",
        status,
        start_time: scheduledAt,
        end_time: endTime,
        timezone,
        meeting_link: link,
        updated_at: nowStr,
      };

      if (existing && existing.length > 0) {
        const { error } = await supabaseAdmin
          .from("bookings")
          .update(bookingRecord)
          .eq("id", existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from("bookings")
          .insert([{ ...bookingRecord, created_at: nowStr }]);
        if (error) throw error;
      }
    } else {
      const local = readLocalDb();
      if (!local.meetings) local.meetings = [];
      const idx = local.meetings.findIndex((m: any) => m.cal_event_id === calEventId);
      if (idx !== -1) {
        local.meetings[idx] = {
          ...local.meetings[idx],
          scheduled_at: scheduledAt,
          attendee_timezone: timezone,
          meeting_link: link,
          status,
          updated_at: new Date().toISOString()
        };
      } else {
        local.meetings.push(meetingEntry);
      }
      writeLocalDb(local);
    }
  },

  async processCalcomBooking(payload: any): Promise<any> {
    const rawTrigger = payload.eventTrigger || payload.triggerEvent || "BOOKING_CREATED";
    const eventTrigger = String(rawTrigger).toUpperCase();
    const booking = payload.payload || payload.data || payload;
    if (!booking || typeof booking !== "object") throw new Error("Invalid Cal.com webhook structure: missing payload or data property.");

    const bookingUid = String(booking.uid || booking.bookingId || booking.id || "");
    const bookingId = bookingUid;
    const eventType = booking.eventTitle || booking.title || booking.eventType?.title || "House Of Workflow Discovery Call";
    const startTime = booking.startTime || booking.start_time || new Date().toISOString();
    const meetingLink = booking.videoCallData?.url || booking.location || booking.meetingUrl || "";
    const attendee = booking.attendees?.[0] || {};

    const name = attendee.name || booking.responses?.name?.value || booking.responses?.name || booking.user?.name || booking.attendeeName || "Booking Attendee";
    const email = (attendee.email || booking.responses?.email?.value || booking.responses?.email || booking.user?.email || booking.attendeeEmail || "").toLowerCase().trim();

    let rawPhone = attendee.phoneNumber || attendee.phone || booking.responses?.phone?.value || booking.responses?.phone || booking.responses?.phoneNumber?.value || booking.responses?.phoneNumber || "";
    let phone = rawPhone.replace(/[^\d+]/g, "");
    if (phone.length === 10 && !phone.startsWith("+")) {
      phone = `+91${phone}`;
    }
    const timezone = attendee.timeZone || booking.timezone || "Asia/Kolkata";

    // 1. Webhook Idempotency Check using Atomic Claim
    const uniqueEventId = `${eventTrigger}:${bookingUid}`;
    const claimStatus = await this.claimWebhookEvent("calcom", uniqueEventId, eventTrigger, payload);
    if (claimStatus === "processed") {
      console.log(`Cal.com webhook already processed for booking ID: ${bookingUid}. Skipping.`);
      return { success: true, duplicate: true };
    }
    if (claimStatus === "in_flight") {
      console.log(`Cal.com webhook is currently in_flight for booking ID: ${bookingUid}. Skipping.`);
      return { success: true, inFlight: true };
    }

    let lead: Lead | null = null;
    let notificationResults: any[] = [];

    const formattedDate = new Date(startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTime = new Date(startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const { sendWhatsAppMessage, sendEmailNotification } = await import("./notifications");

    // ==========================================
    // CASE A: BOOKING_CREATED
    // ==========================================
    if (eventTrigger === "BOOKING_CREATED") {
      lead = await this.findLeadByIdentity(email, phone, bookingUid);

      const leadRecord: any = {
        name,
        first_name: name.split(" ")[0],
        email,
        phone,
        source: "book_a_call",
        status: "meeting_booked",
        cal_booking_uid: bookingUid,
        meeting_datetime: startTime,
        meeting_timezone: timezone,
        meeting_link: meetingLink,
        meeting_confirmed: true,
        meeting_status: "scheduled",
        reminder_sent: false,
        updated_at: new Date().toISOString()
      };

      if (lead) {
        if (isSupabaseEnabled && supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from("leads")
            .update(leadRecord)
            .eq("id", lead.id)
            .select()
            .single();
          if (error) throw error;
          lead = data;
        } else {
          const local = readLocalDb();
          const idx = local.leads.findIndex((l: any) => l.id === lead!.id);
          if (idx !== -1) {
            local.leads[idx] = { ...local.leads[idx], ...leadRecord, cal_event_id: bookingUid };
            syncMockAnalyticsAndScoring(local, lead!.id);
            writeLocalDb(local);
            lead = local.leads[idx];
          }
        }
      } else {
        if (isSupabaseEnabled && supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from("leads")
            .insert([{ ...leadRecord, created_at: new Date().toISOString() }])
            .select()
            .single();
          if (error) throw error;
          lead = data;
        } else {
          const local = readLocalDb();
          const newLead = {
            id: `lead-${Date.now()}`,
            created_at: new Date().toISOString(),
            cal_event_id: bookingUid,
            ...leadRecord
          };
          if (!local.leads) local.leads = [];
          local.leads.push(newLead);
          syncMockAnalyticsAndScoring(local, newLead.id);
          writeLocalDb(local);
          lead = newLead;
        }
      }

      await this.upsertMeeting(lead.id, bookingUid, startTime, timezone, meetingLink, "scheduled");

      try {
        const activityDesc = `Discovery call booked: ${eventType} (Booking ID: ${bookingUid}, Link: ${meetingLink})`;
        await this.addActivityLog(activityDesc);
        await this.addLeadActivity(lead.id, "meeting_booked", activityDesc, "system");
      } catch (logErr) {}

      // Generate AI Meeting Brief, Firmographic Enrichment, Company Research & Lead Score
      try {
        const { generateAIMeetingBrief } = await import("./ai-research");
        const { enrichLeadProfile } = await import("./lead-enrichment");
        const { runCompanyResearchAgent } = await import("./company-research-agent");
        const { calculateLeadScore } = await import("./lead-scoring-engine");
        const { sendMeetingBriefSlackNotification } = await import("./notifications");

        const companyName = lead?.company_name || booking.responses?.company?.value || booking.responses?.company || undefined;
        const website = booking.responses?.website?.value || booking.responses?.website || undefined;

        // 1. Lead Enrichment
        const enrichment = await enrichLeadProfile({
          leadId: lead.id,
          email,
          companyName,
          website
        });
        await this.saveLeadEnrichment(enrichment);

        // 2. Company Research Agent
        const companyResearch = await runCompanyResearchAgent({
          leadId: lead.id,
          companyName: companyName || name + "'s Company",
          website,
          problemDescription: lead?.problem_description || booking.responses?.problem?.value || undefined
        });
        await this.saveCompanyResearch(companyResearch);

        // 3. AI Discovery Call Brief 2.0
        const briefOutput = await generateAIMeetingBrief({
          leadName: name,
          leadEmail: email,
          companyName,
          companyWebsite: website,
          serviceInterest: lead?.service_interest || booking.responses?.service_interest?.value || undefined,
          problemDescription: lead?.problem_description || booking.responses?.problem?.value || undefined,
          teamSize: lead?.team_size || undefined,
          budgetSignal: lead?.budget_signal || undefined,
          notes: `Event Title: ${eventType}`
        });

        await this.saveMeetingBrief({
          lead_id: lead.id,
          booking_id: bookingUid,
          lead_name: name,
          lead_email: email,
          company_name: companyName || "Not Specified",
          company_website: website,
          research_summary: briefOutput.research_summary,
          key_pain_points: briefOutput.key_pain_points,
          opportunities: briefOutput.opportunities,
          discovery_questions: briefOutput.discovery_questions,
          recommended_offer: briefOutput.recommended_offer
        });

        // 4. Initial AI Lead Score
        const scoreResult = calculateLeadScore({
          leadId: lead.id,
          hasQuestionnaire: false,
          employeeCount: enrichment.employee_count,
          urgency: "high",
          budgetSignal: lead?.budget_signal,
          activityCount: 2
        });
        await this.saveLeadScore(scoreResult);

        // Update lead score in leads table
        if (isSupabaseEnabled && supabaseAdmin) {
          await supabaseAdmin.from("leads").update({
            lead_score: scoreResult.total_score,
            lead_score_reason: `Initial AI Deal Score: ${scoreResult.total_score}/100 (${scoreResult.category}).`
          }).eq("id", lead.id);
        }

        await sendMeetingBriefSlackNotification({
          leadId: lead.id,
          leadName: name,
          leadEmail: email,
          meetingDateTime: `${formattedDate} at ${formattedTime} (${timezone})`,
          researchSummary: briefOutput.research_summary,
          discoveryQuestions: briefOutput.discovery_questions,
          recommendedOffer: briefOutput.recommended_offer,
          bookingId: bookingUid
        });

        // 5. Trigger AI Qualification Call (Bolna + Sarvam)
        try {
          const { triggerBolnaQualificationCall } = await import("./bolna-voice-engine");
          await triggerBolnaQualificationCall({
            leadId: lead.id,
            phone,
            leadName: name,
            leadEmail: email,
            companyName,
            flowType: "book_a_call",
            meetingDateTime: `${formattedDate} at ${formattedTime} (${timezone})`,
          });
        } catch (voiceErr) {
          console.error("[CALCOM] AI Voice qualification call trigger error:", voiceErr);
        }

        await this.addLeadActivity(lead.id, "ai_brief_generated", `AI Brief 2.0 & Intelligence generated. Deal Score: ${scoreResult.total_score}/100 (${scoreResult.category}).`, "system");
      } catch (briefErr) {
        console.error("[CALCOM] AI Sales Intelligence generation error:", briefErr);
      }

      const whatsappKey = `booking_confirmation_whatsapp:${bookingUid}`;
      const emailKey = `booking_confirmation_email:${bookingUid}`;
      const jayWaKey = `jay_booking_alert:${bookingUid}`;
      const jayEmailKey = `jay_booking_email:${bookingUid}`;

      const leadHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e0; border-radius: 8px;">
          <h2 style="color: #2C4BFF; margin-top: 0;">Your Call is Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Thanks for booking your discovery call with House Of Workflow. We are excited to speak with you!</p>
          <div style="background: #faf9f6; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e4e0;">
            <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${eventType}</p>
            <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${formattedDate} at ${formattedTime} (${timezone})</p>
            <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2C4BFF;">Join Meeting</a></p>
          </div>
          <p style="font-size: 12px; color: #6b6b6b;">If you need to reschedule or have any questions, please contact support@houseofworkflow.com.</p>
          <hr style="border: none; border-top: 1px solid #e5e4e0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9b9b9b; text-align: center;">House Of Workflow © 2026</p>
        </div>
      `;

      const jayHtml = `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.5; background: #faf9f6; padding: 20px; border-radius: 8px; border: 1px solid #e5e4e0; color: #0d0d0d;">
          <h3>[NEW BOOKED CALL ALERT]</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Event:</strong> ${eventType}</p>
          <p><strong>Time:</strong> ${formattedDate} at ${formattedTime} (${timezone})</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
        </div>
      `;

      notificationResults = await Promise.allSettled([
        sendWhatsAppMessage({
          phone: phone || "",
          userName: name,
          templateName: "how_booking_confirm",
          templateParams: [name, formattedDate, formattedTime, meetingLink, "House Of Workflow"],
          idempotencyKey: whatsappKey,
          leadId: lead.id
        }),
        sendEmailNotification({
          to: email,
          subject: "Booking Confirmed: House Of Workflow Discovery Call",
          html: leadHtml,
          idempotencyKey: emailKey,
          leadId: lead.id
        }),
        sendWhatsAppMessage({
          phone: process.env.JAY_WHATSAPP_NUMBER || "+919876543210",
          userName: "Jay Mahajan",
          templateName: "jay_booking_alert",
          templateParams: [name, email, phone || "N/A", `${formattedDate} ${formattedTime}`, meetingLink],
          idempotencyKey: jayWaKey,
          leadId: lead.id
        }),
        sendEmailNotification({
          to: process.env.JAY_EMAIL || "jay@houseofworkflow.com",
          subject: `[New Call Booked] ${name} — ${formattedDate} ${formattedTime}`,
          html: jayHtml,
          idempotencyKey: jayEmailKey,
          leadId: lead.id
        })
      ]);
    }

    // ==========================================
    // CASE B: BOOKING_RESCHEDULED
    // ==========================================
    else if (eventTrigger === "BOOKING_RESCHEDULED") {
      lead = await this.findLeadByIdentity(email, phone, bookingUid);

      if (!lead) {
        console.warn(`[calcom] BOOKING_RESCHEDULED: no lead found for booking ${bookingUid} — skipping.`);
        return { success: true, skipped: true, reason: "lead_not_found" };
      }

      const leadUpdates: any = {
        meeting_datetime: startTime,
        meeting_timezone: timezone,
        meeting_link: meetingLink,
        meeting_status: "rescheduled",
        reminder_sent: false,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseEnabled && supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .update(leadUpdates)
          .eq("id", lead.id)
          .select()
          .single();
        if (error) throw error;
        lead = data;
      } else {
        const local = readLocalDb();
        const idx = local.leads.findIndex((l: any) => l.id === lead!.id);
        if (idx !== -1) {
          local.leads[idx] = { ...local.leads[idx], ...leadUpdates };
          writeLocalDb(local);
          lead = local.leads[idx];
        }
      }

      await this.upsertMeeting(lead.id, bookingUid, startTime, timezone, meetingLink, "rescheduled");

      try {
        const activityDesc = `Discovery call rescheduled: ${eventType} (Booking ID: ${bookingUid}, New Time: ${startTime})`;
        await this.addActivityLog(activityDesc);
        await this.addLeadActivity(lead.id, "meeting_rescheduled", activityDesc, "system");
      } catch (logErr) {}

      const whatsappKey = `booking_reschedule_whatsapp:${bookingUid}`;
      const emailKey = `booking_reschedule_email:${bookingUid}`;
      const jayWaKey = `jay_reschedule_alert:${bookingUid}`;
      const jayEmailKey = `jay_reschedule_email:${bookingUid}`;

      const leadHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e0; border-radius: 8px;">
          <h2 style="color: #F0A500; margin-top: 0;">Discovery Call Rescheduled</h2>
          <p>Hi ${name},</p>
          <p>Your discovery call with House Of Workflow has been rescheduled.</p>
          <div style="background: #faf9f6; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e4e0;">
            <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${eventType}</p>
            <p style="margin: 0 0 8px 0;"><strong>New Time:</strong> ${formattedDate} at ${formattedTime} (${timezone})</p>
            <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2C4BFF;">Join Meeting</a></p>
          </div>
          <p style="font-size: 12px; color: #6b6b6b;">If you have any questions, please contact support@houseofworkflow.com.</p>
          <hr style="border: none; border-top: 1px solid #e5e4e0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9b9b9b; text-align: center;">House Of Workflow © 2026</p>
        </div>
      `;

      const jayHtml = `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.5; background: #faf9f6; padding: 20px; border-radius: 8px; border: 1px solid #e5e4e0; color: #0d0d0d;">
          <h3>[CALL RESCHEDULED ALERT]</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>New Time:</strong> ${formattedDate} at ${formattedTime} (${timezone})</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
        </div>
      `;

      notificationResults = await Promise.allSettled([
        sendWhatsAppMessage({
          phone: phone || "",
          userName: name,
          templateName: "how_booking_reschedule",
          templateParams: [name, formattedDate, formattedTime, meetingLink],
          idempotencyKey: whatsappKey,
          leadId: lead.id
        }),
        sendEmailNotification({
          to: email,
          subject: "Booking Rescheduled: House Of Workflow Discovery Call",
          html: leadHtml,
          idempotencyKey: emailKey,
          leadId: lead.id
        }),
        sendWhatsAppMessage({
          phone: process.env.JAY_WHATSAPP_NUMBER || "+919876543210",
          userName: "Jay Mahajan",
          templateName: "jay_reschedule_alert",
          templateParams: [name, `${formattedDate} ${formattedTime}`],
          idempotencyKey: jayWaKey,
          leadId: lead.id
        }),
        sendEmailNotification({
          to: process.env.JAY_EMAIL || "jay@houseofworkflow.com",
          subject: `[Rescheduled] ${name} — ${formattedDate} ${formattedTime}`,
          html: jayHtml,
          idempotencyKey: jayEmailKey,
          leadId: lead.id
        })
      ]);
    }

    // ==========================================
    // CASE C: BOOKING_CANCELLED
    // ==========================================
    else if (eventTrigger === "BOOKING_CANCELLED") {
      lead = await this.findLeadByIdentity(email, phone, bookingUid);

      if (!lead) {
        console.warn(`[calcom] BOOKING_CANCELLED: no lead found for booking ${bookingUid} — skipping.`);
        return { success: true, skipped: true, reason: "lead_not_found" };
      }

      const leadUpdates: any = {
        meeting_confirmed: false,
        meeting_status: "cancelled",
        reminder_sent: false,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseEnabled && supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .update(leadUpdates)
          .eq("id", lead.id)
          .select()
          .single();
        if (error) throw error;
        lead = data;
      } else {
        const local = readLocalDb();
        const idx = local.leads.findIndex((l: any) => l.id === lead!.id);
        if (idx !== -1) {
          local.leads[idx] = { ...local.leads[idx], ...leadUpdates };
          writeLocalDb(local);
          lead = local.leads[idx];
        }
      }

      await this.upsertMeeting(lead.id, bookingUid, startTime, timezone, meetingLink, "cancelled");

      try {
        const activityDesc = `Discovery call cancelled: ${eventType} (Booking ID: ${bookingUid})`;
        await this.addActivityLog(activityDesc);
        await this.addLeadActivity(lead.id, "meeting_cancelled", activityDesc, "system");
      } catch (logErr) {}

      const whatsappKey = `booking_cancel_whatsapp:${bookingUid}`;
      const emailKey = `booking_cancel_email:${bookingUid}`;
      const jayWaKey = `jay_cancel_alert:${bookingUid}`;
      const jayEmailKey = `jay_cancel_email:${bookingUid}`;

      const leadHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e0; border-radius: 8px;">
          <h2 style="color: #E05555; margin-top: 0;">Discovery Call Cancelled</h2>
          <p>Hi ${name},</p>
          <p>This email confirms that your discovery call with House Of Workflow has been cancelled.</p>
          <hr style="border: none; border-top: 1px solid #e5e4e0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9b9b9b; text-align: center;">House Of Workflow © 2026</p>
        </div>
      `;

      const jayHtml = `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.5; background: #faf9f6; padding: 20px; border-radius: 8px; border: 1px solid #e5e4e0; color: #0d0d0d;">
          <h3>[CALL CANCELLED ALERT]</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Booking ID:</strong> ${bookingUid}</p>
        </div>
      `;

      notificationResults = await Promise.allSettled([
        sendWhatsAppMessage({
          phone: phone || "",
          userName: name,
          templateName: "how_booking_cancel",
          templateParams: [name],
          idempotencyKey: whatsappKey,
          leadId: lead.id
        }),
        sendEmailNotification({
          to: email,
          subject: "Booking Cancelled: House Of Workflow Discovery Call",
          html: leadHtml,
          idempotencyKey: emailKey,
          leadId: lead.id
        }),
        sendWhatsAppMessage({
          phone: process.env.JAY_WHATSAPP_NUMBER || "+919876543210",
          userName: "Jay Mahajan",
          templateName: "jay_cancel_alert",
          templateParams: [name],
          idempotencyKey: jayWaKey,
          leadId: lead.id
        }),
        sendEmailNotification({
          to: process.env.JAY_EMAIL || "jay@houseofworkflow.com",
          subject: `[Cancelled] ${name}`,
          html: jayHtml,
          idempotencyKey: jayEmailKey,
          leadId: lead.id
        })
      ]);
    }

    // Mark Webhook as Processed
    if (lead) {
      await this.markWebhookProcessed(uniqueEventId, lead.id);
    }

    return {
      success: true,
      leadId: lead?.id,
      bookingId: bookingUid,
      eventTrigger,
      notifications: notificationResults
    };
  },

  async saveMeetingBrief(brief: Omit<MeetingBrief, "id" | "created_at"> & { id?: string }): Promise<MeetingBrief> {
    const record: MeetingBrief = {
      id: brief.id || `brief-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: brief.lead_id,
      booking_id: brief.booking_id || undefined,
      lead_name: brief.lead_name,
      lead_email: brief.lead_email.toLowerCase().trim(),
      company_name: brief.company_name || undefined,
      company_website: brief.company_website || undefined,
      research_summary: brief.research_summary,
      key_pain_points: brief.key_pain_points,
      opportunities: brief.opportunities,
      discovery_questions: brief.discovery_questions,
      recommended_offer: brief.recommended_offer,
      created_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("meeting_briefs")
        .insert([record])
        .select()
        .single();
      if (error) {
        console.warn("[DB] Supabase insert meeting_briefs failed:", error.message);
      } else if (data) {
        return data;
      }
    }

    const local = readLocalDb();
    if (!(local as any).meeting_briefs) (local as any).meeting_briefs = [];
    (local as any).meeting_briefs.push(record);
    writeLocalDb(local);
    return record;
  },

  async getBriefForLead(leadId: string): Promise<MeetingBrief | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("meeting_briefs")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }

    const local = readLocalDb();
    const list = (local as any).meeting_briefs || [];
    return list.filter((b: any) => b.lead_id === leadId).pop() || null;
  },

  async saveQuestionnaireResponse(input: {
    leadId?: string;
    bookingId?: string;
    email: string;
    bottleneck: string;
    techStack: string;
    teamSize: string;
    goal90Days: string;
    bookingReason: string;
  }): Promise<{ id: string; leadId: string }> {
    const email = input.email.toLowerCase().trim();
    let lead: Lead | null = null;

    if (input.leadId) {
      if (isSupabaseEnabled && supabaseAdmin) {
        const { data } = await supabaseAdmin.from("leads").select("*").eq("id", input.leadId).maybeSingle();
        if (data) lead = data;
      }
      if (!lead) {
        const local = readLocalDb();
        lead = (local.leads || []).find((l: any) => l.id === input.leadId) || null;
      }
    }
    if (!lead) {
      lead = await this.findLeadByIdentity(email, "", "");
    }

    if (!lead) {
      const leadRecord: any = {
        name: email.split("@")[0],
        email,
        source: "questionnaire",
        status: "new",
        problem_description: input.goal90Days,
        pain_points: input.bottleneck,
        team_size: input.teamSize,
        existing_solutions: input.techStack,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      if (isSupabaseEnabled && supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .insert([leadRecord])
          .select()
          .single();
        if (error) throw error;
        lead = data;
      } else {
        const local = readLocalDb();
        const newLead = { id: `lead-${Date.now()}`, ...leadRecord };
        if (!local.leads) local.leads = [];
        local.leads.push(newLead);
        writeLocalDb(local);
        lead = newLead as any;
      }
    } else {
      const updates = {
        pain_points: input.bottleneck,
        team_size: input.teamSize,
        existing_solutions: input.techStack,
        problem_description: input.goal90Days,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseEnabled && supabaseAdmin) {
        await supabaseAdmin.from("leads").update(updates).eq("id", lead.id);
      } else {
        const local = readLocalDb();
        const idx = local.leads.findIndex((l: any) => l.id === lead!.id);
        if (idx !== -1) {
          local.leads[idx] = { ...local.leads[idx], ...updates };
          writeLocalDb(local);
        }
      }
    }

    const qRecord: PreCallQuestionnaire = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: lead!.id,
      booking_id: input.bookingId || undefined,
      lead_email: email,
      bottleneck: input.bottleneck,
      tech_stack: input.techStack,
      team_size: input.teamSize,
      goal_90_days: input.goal90Days,
      booking_reason: input.bookingReason,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("pre_call_questionnaires")
        .insert([qRecord]);
      if (error) {
        console.warn("[DB] Supabase insert pre_call_questionnaires failed:", error.message);
      }
    }

    const local = readLocalDb();
    if (!(local as any).pre_call_questionnaires) (local as any).pre_call_questionnaires = [];
    (local as any).pre_call_questionnaires.push(qRecord);
    writeLocalDb(local);

    try {
      const activityDesc = `Pre-Call Questionnaire submitted. Bottleneck: ${input.bottleneck.substring(0, 80)}...`;
      await this.addLeadActivity(lead!.id, "questionnaire_submitted", activityDesc, "lead");
    } catch (logErr) {}

    return { id: qRecord.id, leadId: lead!.id };
  },

  async getQuestionnaireForLead(leadId: string): Promise<PreCallQuestionnaire | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("pre_call_questionnaires")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }

    const local = readLocalDb();
    const list = (local as any).pre_call_questionnaires || [];
    return list.filter((q: any) => q.lead_id === leadId).pop() || null;
  },

  async saveLeadEnrichment(enrichment: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("lead_enrichment_reports")
        .insert([enrichment])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).lead_enrichment_reports) (local as any).lead_enrichment_reports = [];
    (local as any).lead_enrichment_reports.push(enrichment);
    writeLocalDb(local);
    return enrichment;
  },

  async getEnrichmentForLead(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("lead_enrichment_reports")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).lead_enrichment_reports || [];
    return list.filter((r: any) => r.lead_id === leadId).pop() || null;
  },

  async saveCompanyResearch(research: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("company_research_reports")
        .insert([research])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).company_research_reports) (local as any).company_research_reports = [];
    (local as any).company_research_reports.push(research);
    writeLocalDb(local);
    return research;
  },

  async getCompanyResearchForLead(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("company_research_reports")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).company_research_reports || [];
    return list.filter((r: any) => r.lead_id === leadId).pop() || null;
  },

  async saveMeetingOutcome(input: {
    leadId: string;
    bookingId?: string;
    meetingNotes: string;
    budget?: number;
    budgetConfidence?: string;
    timeline?: string;
    decisionMakers?: string;
    painPointsConfirmed?: string;
    nextSteps?: string;
    stageUpdate?: string;
  }): Promise<any> {
    const { generateProposalRecommendation } = await import("./proposal-engine");
    const { calculateLeadScore } = await import("./lead-scoring-engine");

    const lead = await this.getLeadById(input.leadId);
    if (!lead) throw new Error("Lead not found");

    const outcomeRecord = {
      id: `mo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: input.leadId,
      booking_id: input.bookingId || null,
      meeting_notes: input.meetingNotes,
      budget: input.budget || null,
      budget_confidence: input.budgetConfidence || "estimated",
      timeline: input.timeline || null,
      decision_makers: input.decisionMakers || null,
      pain_points_confirmed: input.painPointsConfirmed || null,
      next_steps: input.nextSteps || null,
      ai_summary: `Discovery call outcome recorded. Budget: ${input.budget ? '$' + input.budget : 'TBD'}, Timeline: ${input.timeline || 'Immediate'}.`,
      recommended_next_action: `Send proposal for ${input.timeline || 'upcoming sprint'} and schedule decision maker review.`,
      score_delta: 15,
      created_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("meeting_outcomes").insert([outcomeRecord]);
    }
    const local = readLocalDb();
    if (!(local as any).meeting_outcomes) (local as any).meeting_outcomes = [];
    (local as any).meeting_outcomes.push(outcomeRecord);
    writeLocalDb(local);

    // Generate Proposal Recommendation
    const proposal = await generateProposalRecommendation({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name,
      serviceInterest: lead.service_interest,
      meetingNotes: input.meetingNotes,
      confirmedBudget: input.budget,
      painPoints: input.painPointsConfirmed
    });
    await this.saveProposalRecommendation(proposal);

    // Update Lead Status & Lead Score
    const newStatus = input.stageUpdate || "discovery_completed";
    const newScoreResult = calculateLeadScore({
      leadId: lead.id,
      hasQuestionnaire: true,
      companySize: lead.team_size,
      urgency: input.timeline || lead.urgency,
      budgetSignal: input.budget ? String(input.budget) : lead.budget_signal,
      meetingCompleted: true,
      meetingOutcomeNotes: input.meetingNotes
    });

    await this.saveLeadScore(newScoreResult);

    const leadUpdates = {
      status: newStatus,
      lead_score: newScoreResult.total_score,
      lead_score_reason: `Discovery call outcome completed. Re-evaluated deal score: ${newScoreResult.total_score}/100 (${newScoreResult.category}).`,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("leads").update(leadUpdates).eq("id", lead.id);
    } else {
      const idx = local.leads.findIndex((l: any) => l.id === lead.id);
      if (idx !== -1) {
        local.leads[idx] = { ...local.leads[idx], ...leadUpdates };
        writeLocalDb(local);
      }
    }

    try {
      await this.addLeadActivity(lead.id, "meeting_outcome_logged", `Discovery call outcome logged. Status updated to ${newStatus}.`, "admin");
    } catch (e) {}

    return outcomeRecord;
  },

  async getMeetingOutcomesForLead(leadId: string): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("meeting_outcomes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).meeting_outcomes || [];
    return list.filter((m: any) => m.lead_id === leadId);
  },

  async saveProposalRecommendation(proposal: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("proposal_recommendations")
        .insert([proposal])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).proposal_recommendations) (local as any).proposal_recommendations = [];
    (local as any).proposal_recommendations.push(proposal);
    writeLocalDb(local);
    return proposal;
  },

  async getProposalForLead(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("proposal_recommendations")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).proposal_recommendations || [];
    return list.filter((p: any) => p.lead_id === leadId).pop() || null;
  },

  async saveLeadScore(scoreResult: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("lead_scores").insert([scoreResult]);
    }
    const local = readLocalDb();
    if (!(local as any).lead_scores) (local as any).lead_scores = [];
    (local as any).lead_scores.push(scoreResult);
    writeLocalDb(local);
    return scoreResult;
  },

  async getLeadScoreForLead(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("lead_scores")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).lead_scores || [];
    return list.filter((s: any) => s.lead_id === leadId).pop() || null;
  },

  async saveMeetingTranscript(input: {
    leadId: string;
    transcript: string;
    recordingUrl?: string;
    durationMinutes?: number;
  }): Promise<any> {
    const record = {
      id: `mt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: input.leadId,
      recording_url: input.recordingUrl || null,
      transcript: input.transcript,
      duration_minutes: input.durationMinutes || Math.round(input.transcript.length / 500) || 15,
      created_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("meeting_transcripts").insert([record]);
    }
    const local = readLocalDb();
    if (!(local as any).meeting_transcripts) (local as any).meeting_transcripts = [];
    (local as any).meeting_transcripts.push(record);
    writeLocalDb(local);
    return record;
  },

  async getMeetingTranscriptsForLead(leadId: string): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("meeting_transcripts")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).meeting_transcripts || [];
    return list.filter((t: any) => t.lead_id === leadId);
  },

  async saveMeetingInsights(input: {
    leadId: string;
    transcriptId: string;
    insights: any;
  }): Promise<any> {
    const record = {
      id: `mi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lead_id: input.leadId,
      transcript_id: input.transcriptId,
      executive_summary: input.insights.executiveSummary,
      pain_points: input.insights.painPoints || [],
      business_goals: input.insights.businessGoals || [],
      objections: input.insights.objections || [],
      buying_signals: input.insights.buyingSignals || [],
      competitors_mentioned: input.insights.competitorsMentioned || [],
      stakeholders: input.insights.stakeholders || [],
      budget_signals: input.insights.budgetSignals || [],
      urgency_score: input.insights.urgencyScore || 50,
      close_probability: input.insights.closeProbability || 50,
      next_actions: input.insights.nextActions || [],
      sentiment: input.insights.sentiment || "neutral",
      created_at: new Date().toISOString()
    };

    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("meeting_insights").insert([record]);
    }
    const local = readLocalDb();
    if (!(local as any).meeting_insights) (local as any).meeting_insights = [];
    (local as any).meeting_insights.push(record);
    writeLocalDb(local);
    return record;
  },

  async getLatestMeetingIntelligenceForLead(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("meeting_insights")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).meeting_insights || [];
    return list.filter((i: any) => i.lead_id === leadId).pop() || null;
  },

  async updateLeadMetadata(leadId: string, updates: Record<string, any>): Promise<any> {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("leads").update(payload).eq("id", leadId);
    }
    const local = readLocalDb();
    if (!local.leads) local.leads = [];
    const idx = local.leads.findIndex((l: any) => l.id === leadId);
    if (idx !== -1) {
      local.leads[idx] = { ...local.leads[idx], ...payload };
    } else {
      local.leads.push({ id: leadId, name: updates.name || "Lead", email: "test@example.com", status: "new", created_at: new Date().toISOString(), ...payload });
    }
    writeLocalDb(local);
    return true;
  },

  async saveProposalEngagement(engagement: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("proposal_engagements")
        .upsert([engagement])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).proposal_engagements) (local as any).proposal_engagements = [];
    const idx = (local as any).proposal_engagements.findIndex(
      (pe: any) => pe.proposal_id === engagement.proposal_id && pe.lead_id === engagement.lead_id
    );
    if (idx !== -1) {
      (local as any).proposal_engagements[idx] = { ...(local as any).proposal_engagements[idx], ...engagement };
    } else {
      (local as any).proposal_engagements.push(engagement);
    }
    writeLocalDb(local);
    return engagement;
  },

  async getProposalEngagement(proposalId: string, leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("proposal_engagements")
        .select("*")
        .eq("lead_id", leadId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).proposal_engagements || [];
    return list.find((pe: any) => pe.lead_id === leadId || pe.proposal_id === proposalId) || null;
  },

  async saveDealStakeholder(stakeholder: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("deal_stakeholders")
        .insert([stakeholder])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).deal_stakeholders) (local as any).deal_stakeholders = [];
    (local as any).deal_stakeholders.push(stakeholder);
    writeLocalDb(local);
    return stakeholder;
  },

  async getStakeholdersForLead(leadId: string): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("deal_stakeholders")
        .select("*")
        .eq("lead_id", leadId);
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).deal_stakeholders || [];
    return list.filter((s: any) => s.lead_id === leadId);
  },

  async saveDailyRevenueBrief(brief: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("daily_revenue_briefs").insert([brief]);
    }
    const local = readLocalDb();
    if (!(local as any).daily_revenue_briefs) (local as any).daily_revenue_briefs = [];
    (local as any).daily_revenue_briefs.push(brief);
    writeLocalDb(local);
    return brief;
  },

  async saveFollowUpSequence(seq: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("followup_sequences").upsert([seq]);
    }
    const local = readLocalDb();
    if (!(local as any).followup_sequences) (local as any).followup_sequences = [];
    const idx = (local as any).followup_sequences.findIndex((s: any) => s.lead_id === seq.lead_id);
    if (idx !== -1) {
      (local as any).followup_sequences[idx] = { ...(local as any).followup_sequences[idx], ...seq };
    } else {
      (local as any).followup_sequences.push(seq);
    }
    writeLocalDb(local);
    return seq;
  },

  async getFollowUpSequenceForLead(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("followup_sequences")
        .select("*")
        .eq("lead_id", leadId)
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).followup_sequences || [];
    return list.find((s: any) => s.lead_id === leadId) || null;
  },

  async getLeads(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return local.leads || [];
  },

  async getLeadById(leadId: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return (local.leads || []).find((l: any) => l.id === leadId) || null;
  },

  async saveDealExecutionPlan(plan: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("deal_execution_plans")
        .upsert([plan])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).deal_execution_plans) (local as any).deal_execution_plans = [];
    (local as any).deal_execution_plans.push(plan);
    writeLocalDb(local);
    return plan;
  },

  async saveExecutionQueueItem(item: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("execution_queue")
        .upsert([item])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).execution_queue) (local as any).execution_queue = [];
    const idx = (local as any).execution_queue.findIndex((eq: any) => eq.id === item.id);
    if (idx !== -1) {
      (local as any).execution_queue[idx] = { ...(local as any).execution_queue[idx], ...item };
    } else {
      (local as any).execution_queue.push(item);
    }
    writeLocalDb(local);
    return item;
  },

  async getPendingExecutionQueueItems(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("execution_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).execution_queue || [];
    return list.filter((eq: any) => eq.status === "pending");
  },

  async getExecutionQueueItemById(id: string): Promise<any | null> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("execution_queue")
        .select("*")
        .eq("id", id)
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    const list = (local as any).execution_queue || [];
    return list.find((eq: any) => eq.id === id) || null;
  },

  async saveApprovalLog(log: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("approval_logs").insert([log]);
    }
    const local = readLocalDb();
    if (!(local as any).approval_logs) (local as any).approval_logs = [];
    (local as any).approval_logs.push(log);
    writeLocalDb(local);
    return log;
  },

  async saveProspectAccount(account: any): Promise<any> {
    const record = {
      id: account.id || `pa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...account,
      created_at: new Date().toISOString()
    };
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("prospect_accounts")
        .upsert([record])
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    if (!(local as any).prospect_accounts) (local as any).prospect_accounts = [];
    (local as any).prospect_accounts.push(record);
    writeLocalDb(local);
    return record;
  },

  async getProspectAccounts(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("prospect_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return (local as any).prospect_accounts || [];
  },

  async saveProspectContact(contact: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("prospect_contacts").insert([contact]);
    }
    const local = readLocalDb();
    if (!(local as any).prospect_contacts) (local as any).prospect_contacts = [];
    (local as any).prospect_contacts.push(contact);
    writeLocalDb(local);
    return contact;
  },

  async saveProspectResearchReport(report: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("prospect_research_reports").insert([report]);
    }
    const local = readLocalDb();
    if (!(local as any).prospect_research_reports) (local as any).prospect_research_reports = [];
    (local as any).prospect_research_reports.push(report);
    writeLocalDb(local);
    return report;
  },

  async saveIntentSignal(signal: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("intent_signals").insert([signal]);
    }
    const local = readLocalDb();
    if (!(local as any).intent_signals) (local as any).intent_signals = [];
    (local as any).intent_signals.push(signal);
    writeLocalDb(local);
    return signal;
  },

  async getLatestIntentSignals(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("intent_signals")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(20);
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return (local as any).intent_signals || [];
  },

  async saveProspectScore(score: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("prospect_scores").insert([score]);
    }
    const local = readLocalDb();
    if (!(local as any).prospect_scores) (local as any).prospect_scores = [];
    (local as any).prospect_scores.push(score);
    writeLocalDb(local);
    return score;
  },

  async saveAccountPriority(priority: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("account_priorities").insert([priority]);
    }
    const local = readLocalDb();
    if (!(local as any).account_priorities) (local as any).account_priorities = [];
    (local as any).account_priorities.push(priority);
    writeLocalDb(local);
    return priority;
  },

  async getAccountPriorities(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("account_priorities")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return (local as any).account_priorities || [];
  },

  async saveReactivationOpportunity(opp: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("reactivation_opportunities").insert([opp]);
    }
    const local = readLocalDb();
    if (!(local as any).reactivation_opportunities) (local as any).reactivation_opportunities = [];
    (local as any).reactivation_opportunities.push(opp);
    writeLocalDb(local);
    return opp;
  },

  async getReactivationOpportunities(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("reactivation_opportunities")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return (local as any).reactivation_opportunities || [];
  },

  async saveChampionReport(report: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("champion_reports").insert([report]);
    }
    const local = readLocalDb();
    if (!(local as any).champion_reports) (local as any).champion_reports = [];
    (local as any).champion_reports.push(report);
    writeLocalDb(local);
    return report;
  },

  async saveStakeholderCoverageReport(report: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("stakeholder_coverage_reports").insert([report]);
    }
    const local = readLocalDb();
    if (!(local as any).stakeholder_coverage_reports) (local as any).stakeholder_coverage_reports = [];
    (local as any).stakeholder_coverage_reports.push(report);
    writeLocalDb(local);
    return report;
  },

  async savePipelineAnalysisReport(report: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("pipeline_analysis_reports").insert([report]);
    }
    const local = readLocalDb();
    if (!(local as any).pipeline_analysis_reports) (local as any).pipeline_analysis_reports = [];
    (local as any).pipeline_analysis_reports.push(report);
    writeLocalDb(local);
    return report;
  },

  async saveExecutiveScorecard(scorecard: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("executive_scorecards").insert([scorecard]);
    }
    const local = readLocalDb();
    if (!(local as any).executive_scorecards) (local as any).executive_scorecards = [];
    (local as any).executive_scorecards.push(scorecard);
    writeLocalDb(local);
    return scorecard;
  },

  async saveOptimizationRecommendation(opt: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("optimization_recommendations").insert([opt]);
    }
    const local = readLocalDb();
    if (!(local as any).optimization_recommendations) (local as any).optimization_recommendations = [];
    (local as any).optimization_recommendations.push(opt);
    writeLocalDb(local);
    return opt;
  },

  async saveBoardReport(report: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("board_reports").insert([report]);
    }
    const local = readLocalDb();
    if (!(local as any).board_reports) (local as any).board_reports = [];
    (local as any).board_reports.push(report);
    writeLocalDb(local);
    return report;
  },

  async saveMarketIntelligenceReport(report: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("market_intelligence_reports").insert([report]);
    }
    const local = readLocalDb();
    if (!(local as any).market_intelligence_reports) (local as any).market_intelligence_reports = [];
    (local as any).market_intelligence_reports.push(report);
    writeLocalDb(local);
    return report;
  },

  async saveCompetitorIntelligence(comp: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("competitor_intelligence").insert([comp]);
    }
    const local = readLocalDb();
    if (!(local as any).competitor_intelligence) (local as any).competitor_intelligence = [];
    (local as any).competitor_intelligence.push(comp);
    writeLocalDb(local);
    return comp;
  },

  async getCompetitorIntelligence(): Promise<any[]> {
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("competitor_intelligence")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return (local as any).competitor_intelligence || [];
  },

  async saveExpansionOpportunity(opp: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("expansion_opportunities").insert([opp]);
    }
    const local = readLocalDb();
    if (!(local as any).expansion_opportunities) (local as any).expansion_opportunities = [];
    (local as any).expansion_opportunities.push(opp);
    writeLocalDb(local);
    return opp;
  },

  async saveStrategicAlert(alert: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("strategic_alerts").insert([alert]);
    }
    const local = readLocalDb();
    if (!(local as any).strategic_alerts) (local as any).strategic_alerts = [];
    (local as any).strategic_alerts.push(alert);
    writeLocalDb(local);
    return alert;
  },

  async saveClientProfitabilityReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("client_profitability_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).client_profitability_reports) (local as any).client_profitability_reports = [];
    (local as any).client_profitability_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveServiceProfitabilityReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("service_profitability_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).service_profitability_reports) (local as any).service_profitability_reports = [];
    (local as any).service_profitability_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveCashflowForecast(forecast: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("cashflow_forecasts").insert([forecast]);
    }
    const local = readLocalDb();
    if (!(local as any).cashflow_forecasts) (local as any).cashflow_forecasts = [];
    (local as any).cashflow_forecasts.push(forecast);
    writeLocalDb(local);
    return forecast;
  },

  async saveHiringImpactReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("hiring_impact_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).hiring_impact_reports) (local as any).hiring_impact_reports = [];
    (local as any).hiring_impact_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveFinancialAlert(alert: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("financial_alerts").insert([alert]);
    }
    const local = readLocalDb();
    if (!(local as any).financial_alerts) (local as any).financial_alerts = [];
    (local as any).financial_alerts.push(alert);
    writeLocalDb(local);
    return alert;
  },

  async saveClientOnboardingReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("client_onboarding_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).client_onboarding_reports) (local as any).client_onboarding_reports = [];
    (local as any).client_onboarding_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveDeliveryHealthReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("delivery_health_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).delivery_health_reports) (local as any).delivery_health_reports = [];
    (local as any).delivery_health_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveCustomerHealthScore(score: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("customer_health_scores").insert([score]);
    }
    const local = readLocalDb();
    if (!(local as any).customer_health_scores) (local as any).customer_health_scores = [];
    (local as any).customer_health_scores.push(score);
    writeLocalDb(local);
    return score;
  },

  async saveRenewalForecast(forecast: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("renewal_forecasts").insert([forecast]);
    }
    const local = readLocalDb();
    if (!(local as any).renewal_forecasts) (local as any).renewal_forecasts = [];
    (local as any).renewal_forecasts.push(forecast);
    writeLocalDb(local);
    return forecast;
  },

  async saveCustomerExpansionOpportunity(opp: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("expansion_opportunities").insert([opp]);
    }
    const local = readLocalDb();
    if (!(local as any).expansion_opportunities) (local as any).expansion_opportunities = [];
    (local as any).expansion_opportunities.push(opp);
    writeLocalDb(local);
    return opp;
  },

  async saveCustomerSentimentReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("customer_sentiment_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).customer_sentiment_reports) (local as any).customer_sentiment_reports = [];
    (local as any).customer_sentiment_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveProject(proj: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("projects").insert([proj]);
    }
    const local = readLocalDb();
    if (!(local as any).projects) (local as any).projects = [];
    (local as any).projects.push(proj);
    writeLocalDb(local);
    return proj;
  },

  async saveProjectMilestone(m: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("project_milestones").insert([m]);
    }
    const local = readLocalDb();
    if (!(local as any).project_milestones) (local as any).project_milestones = [];
    (local as any).project_milestones.push(m);
    writeLocalDb(local);
    return m;
  },

  async saveResourceAllocation(alloc: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("resource_allocations").insert([alloc]);
    }
    const local = readLocalDb();
    if (!(local as any).resource_allocations) (local as any).resource_allocations = [];
    (local as any).resource_allocations.push(alloc);
    writeLocalDb(local);
    return alloc;
  },

  async saveTeamCapacityReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("team_capacity_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).team_capacity_reports) (local as any).team_capacity_reports = [];
    (local as any).team_capacity_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveWorkforceUtilizationReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("workforce_utilization_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).workforce_utilization_reports) (local as any).workforce_utilization_reports = [];
    (local as any).workforce_utilization_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveDeliveryForecast(fc: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("delivery_forecasts").insert([fc]);
    }
    const local = readLocalDb();
    if (!(local as any).delivery_forecasts) (local as any).delivery_forecasts = [];
    (local as any).delivery_forecasts.push(fc);
    writeLocalDb(local);
    return fc;
  },

  async saveProjectProfitabilityReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("project_profitability_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).project_profitability_reports) (local as any).project_profitability_reports = [];
    (local as any).project_profitability_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveDeliveryRiskReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("delivery_risk_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).delivery_risk_reports) (local as any).delivery_risk_reports = [];
    (local as any).delivery_risk_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveAIAgentWorkload(wl: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("ai_agent_workloads").insert([wl]);
    }
    const local = readLocalDb();
    if (!(local as any).ai_agent_workloads) (local as any).ai_agent_workloads = [];
    (local as any).ai_agent_workloads.push(wl);
    writeLocalDb(local);
    return wl;
  },

  async saveCompanyHealthReport(rep: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("company_health_reports").insert([rep]);
    }
    const local = readLocalDb();
    if (!(local as any).company_health_reports) (local as any).company_health_reports = [];
    (local as any).company_health_reports.push(rep);
    writeLocalDb(local);
    return rep;
  },

  async saveExecutiveAction(act: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("executive_actions").insert([act]);
    }
    const local = readLocalDb();
    if (!(local as any).executive_actions) (local as any).executive_actions = [];
    (local as any).executive_actions.push(act);
    writeLocalDb(local);
    return act;
  },

  async saveDecisionRecommendation(dec: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("decision_recommendations").insert([dec]);
    }
    const local = readLocalDb();
    if (!(local as any).decision_recommendations) (local as any).decision_recommendations = [];
    (local as any).decision_recommendations.push(dec);
    writeLocalDb(local);
    return dec;
  },

  async saveStrategicPriority(prio: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("strategic_priorities").insert([prio]);
    }
    const local = readLocalDb();
    if (!(local as any).strategic_priorities) (local as any).strategic_priorities = [];
    (local as any).strategic_priorities.push(prio);
    writeLocalDb(local);
    return prio;
  },

  async saveAgentCollaboration(collab: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("agent_collaborations").insert([collab]);
    }
    const local = readLocalDb();
    if (!(local as any).agent_collaborations) (local as any).agent_collaborations = [];
    (local as any).agent_collaborations.push(collab);
    writeLocalDb(local);
    return collab;
  },

  async saveWeeklyCEOBrief(brief: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("weekly_ceo_briefs").insert([brief]);
    }
    const local = readLocalDb();
    if (!(local as any).weekly_ceo_briefs) (local as any).weekly_ceo_briefs = [];
    (local as any).weekly_ceo_briefs.push(brief);
    writeLocalDb(local);
    return brief;
  },

  async saveCompanyObjective(obj: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("company_objectives").insert([obj]);
    }
    const local = readLocalDb();
    if (!(local as any).company_objectives) (local as any).company_objectives = [];
    (local as any).company_objectives.push(obj);
    writeLocalDb(local);
    return obj;
  },

  async saveObjectiveProgress(prog: any): Promise<any> {
    if (isSupabaseEnabled && supabaseAdmin) {
      await supabaseAdmin.from("objective_progress").insert([prog]);
    }
    const local = readLocalDb();
    if (!(local as any).objective_progress) (local as any).objective_progress = [];
    (local as any).objective_progress.push(prog);
    writeLocalDb(local);
    return prog;
  },

  async getFounderCommandCenterData(): Promise<any> {
    const leads = await this.getLeads();
    const { calculateRevenueForecast } = await import("./revenue-forecast-engine");
    
    const hotLeads = leads.filter((l) => (l.lead_score || 0) >= 70);
    const scheduledMeetings = leads.filter((l) => l.status === "meeting_booked" || l.meeting_confirmed);
    const stalledDeals = leads.filter((l) => l.status === "proposal_sent" || l.status === "negotiation");

    // Deal Risk Monitor (No activity > 10 days OR close probability < 40%)
    const now = Date.now();
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    const dealsAtRisk = leads.filter((l) => {
      if (l.status === "won" || l.status === "lost") return false;
      const lastAct = l.updated_at ? new Date(l.updated_at).getTime() : new Date(l.created_at).getTime();
      const isStale = (now - lastAct) > tenDaysMs;
      const isLowProb = l.close_probability !== undefined && l.close_probability < 40;
      return isStale || isLowProb;
    });

    // Top Opportunity & Highest Probability Deal
    const topOpportunity = leads
      .filter((l) => l.status !== "won" && l.status !== "lost")
      .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))[0] || null;

    const highestProbDeal = leads
      .filter((l) => l.status !== "won" && l.status !== "lost")
      .sort((a, b) => (b.close_probability || 0) - (a.close_probability || 0))[0] || null;

    // Revenue Forecast Engine
    const forecastResult = calculateRevenueForecast({ leads });

    const dailyBriefingTextV2 = `Good morning. You have ${scheduledMeetings.length} discovery calls scheduled today.\n\nTop Opportunity: ${topOpportunity ? topOpportunity.name + ' (' + (topOpportunity.company_name || 'Prospect') + ')' : 'N/A'}\nClose Probability: ${highestProbDeal ? (highestProbDeal.close_probability || 75) + '%' : '75%'}\n\nNew Buying Signals: 7\nBudget Discussions: ${scheduledMeetings.length}\nDeals At Risk: ${dealsAtRisk.length}\nLikely Revenue Forecast: $${forecastResult.likelyRevenue.toLocaleString()}\n\nRecommended Actions:\n- Follow up proposal for ${topOpportunity ? topOpportunity.name : 'top leads'}\n- Review deals at risk in Command Center\n- Schedule technical review for proposal stage deals`;

    return {
      dailyBriefingText: dailyBriefingTextV2,
      todaysMeetingsCount: scheduledMeetings.length,
      hotLeadsCount: hotLeads.length,
      stalledDealsCount: stalledDeals.length,
      dealsAtRiskCount: dealsAtRisk.length,
      dealsAtRisk: dealsAtRisk.slice(0, 5),
      pipelineValue: forecastResult.bestCaseRevenue,
      revenueForecast: forecastResult.likelyRevenue,
      committedRevenue: forecastResult.committedRevenue,
      forecastResult,
      topOpportunity,
      highestProbDeal,
      hotLeads: hotLeads.slice(0, 5),
      stalledDeals: stalledDeals.slice(0, 5),
      todaysMeetings: scheduledMeetings.slice(0, 5)
    };
  }
};
