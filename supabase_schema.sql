-- ==========================================
-- HOUSE OF WORKFLOW DATABASE SCHEMA
-- Version 2.0 — Production Hardened
-- Supabase / PostgreSQL
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean reset helper (Uncomment for local migration resets)
-- DROP TABLE IF EXISTS rate_limit_log CASCADE;
-- DROP TABLE IF EXISTS error_logs CASCADE;
-- DROP TABLE IF EXISTS manual_tasks CASCADE;
-- DROP TABLE IF EXISTS communication_logs CASCADE;
-- DROP TABLE IF EXISTS meetings CASCADE;
-- DROP TABLE IF EXISTS call_logs CASCADE;
-- DROP TABLE IF EXISTS webhook_events CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;

-- 1. CORE TABLE: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Intake Fields
    name TEXT NOT NULL,
    full_name TEXT,
    lead_uid TEXT UNIQUE,
    company TEXT,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT, -- 'web_dev' | 'ai_automation' | 'both' | 'not_sure'
    problem_description TEXT,

    -- Lifecycle & Ownership
    source TEXT DEFAULT 'experience_service', -- 'experience_service' | 'book_a_call'
    status TEXT DEFAULT 'new_lead', -- 'new_lead' | 'called' | 'qualified' | 'meeting_booked' | 'meeting_completed' | 'proposal_sent' | 'won' | 'lost' | 'not_interested'
    qualification_status TEXT DEFAULT 'pending', -- 'pending' | 'qualified' | 'needs_follow_up' | 'not_interested' | 'no_answer' | 'voicemail'
    owner_id UUID,
    assigned_at TIMESTAMPTZ,
    outcome TEXT, -- 'won' | 'lost' | 'unqualified' | 'no_response'
    outcome_at TIMESTAMPTZ,

    -- Consent & Verification
    consent_given BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    consent_ip TEXT,
    consent_user_agent TEXT,
    is_spam BOOLEAN DEFAULT false,
    rate_limited BOOLEAN DEFAULT false,

    -- Attribution
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    landing_page TEXT,
    referrer TEXT,

    -- Call Automation & Security Tokens
    call_opted_in BOOLEAN DEFAULT false,
    call_scheduled_at TIMESTAMPTZ,
    call_attempted_at TIMESTAMPTZ,
    call_answered BOOLEAN,
    call_attempts INTEGER DEFAULT 0,
    call_in_progress BOOLEAN DEFAULT false,
    call_outcome TEXT,
    call_summary TEXT,
    call_transcript TEXT,
    call_recording_url TEXT,
    call_duration_sec INTEGER,

    -- Single-Use Single-Action Call Token
    call_token TEXT UNIQUE,
    call_token_expires_at TIMESTAMPTZ,
    call_token_used BOOLEAN DEFAULT false,

    -- GPT Lead Scoring Metrics
    fit_score INTEGER,
    intent_score INTEGER,
    urgency_score INTEGER,
    budget_score INTEGER,
    lead_score INTEGER,
    lead_score_reason TEXT,
    lead_temperature TEXT DEFAULT 'warm', -- 'hot' | 'warm' | 'cold'

    budget_level TEXT,
    urgency TEXT,
    qualification TEXT,
    gpt_summary TEXT,
    recommended_service TEXT,
    talking_points JSONB DEFAULT '[]'::jsonb,
    pain_points TEXT,
    budget_signal TEXT,
    team_size TEXT,
    existing_solutions TEXT,

    -- Temperature & Decay
    temperature TEXT DEFAULT 'warm', -- 'hot' | 'warm' | 'cold'
    last_interaction_at TIMESTAMPTZ DEFAULT now(),

    -- Meeting Sync
    meeting_booked BOOLEAN DEFAULT false,
    meeting_time TIMESTAMPTZ,
    meeting_datetime TIMESTAMPTZ,
    attendee_timezone TEXT,
    meeting_link TEXT,
    meeting_confirmed BOOLEAN DEFAULT false,
    cal_event_id TEXT,
    reminder_sent BOOLEAN DEFAULT false,

    -- Internal Operational Fields
    internal_notes TEXT,
    callback_requested BOOLEAN DEFAULT false,
    callback_time TEXT
);

-- 2. CORE TABLE: webhook_events (Idempotency Engine)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'calcom' | 'bolna' | 'sarvam' | 'aisensy' | 'resend' | 'supabase'
    event_type TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    payload_hash TEXT,
    received_at TIMESTAMPTZ DEFAULT now(),
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    workflow_triggered TEXT,
    error_message TEXT,
    CONSTRAINT unique_provider_event UNIQUE (provider, provider_event_id)
);

-- 3. CORE TABLE: call_logs
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    call_provider TEXT NOT NULL, -- 'bolna' | 'sarvam'
    call_sid TEXT UNIQUE NOT NULL,
    agent_id TEXT,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_sec INTEGER,
    outcome TEXT, -- 'answered' | 'no_answer' | 'voicemail' | 'failed'
    provider_status TEXT,
    hangup_reason TEXT,
    transcript TEXT,
    recording_url TEXT,
    recording_expires_at TIMESTAMPTZ,
    cost NUMERIC(10,4),
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CORE TABLE: meetings
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    cal_event_id TEXT UNIQUE NOT NULL,
    cal_uid TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    attendee_timezone TEXT,
    duration_min INTEGER DEFAULT 30,
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show'
    reminder_sent BOOLEAN DEFAULT false,
    outcome_notes TEXT,
    rescheduled_from TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CORE TABLE: communication_logs
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'whatsapp' | 'email' | 'voice'
    provider TEXT NOT NULL, -- 'aisensy' | 'resend' | 'bolna' | 'sarvam'
    message_type TEXT,
    template_name TEXT,
    provider_message_id TEXT,
    status TEXT DEFAULT 'queued', -- 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CORE TABLE: manual_tasks
CREATE TABLE IF NOT EXISTS manual_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL, -- 'call_failed' | 'whatsapp_failed' | 'email_failed' | 'booking_failed' | 'openai_failed' | 'manual_review' | 'follow_up'
    reason TEXT NOT NULL,
    priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)), -- 1 = urgent, 2 = today, 3 = this week
    status TEXT DEFAULT 'open', -- 'open' | 'in_progress' | 'resolved'
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 7. CORE TABLE: error_logs
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    error_code TEXT,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CORE TABLE: rate_limit_log
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    phone TEXT,
    email TEXT,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CMS & CONTENT TABLES (For website CMS & admin authorization)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    read_time TEXT,
    author TEXT DEFAULT 'Jay Mahajan',
    excerpt TEXT,
    body TEXT,
    status TEXT DEFAULT 'draft',
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    industry_tag TEXT,
    service_tag TEXT,
    context_body TEXT,
    result_1_value TEXT,
    result_1_label TEXT,
    result_2_value TEXT,
    result_2_label TEXT,
    image_url TEXT,
    image_alt TEXT,
    sort_order INTEGER DEFAULT 99,
    published BOOLEAN DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    team TEXT,
    location TEXT DEFAULT 'Pune, India (Remote-friendly)',
    type TEXT,
    salary_range TEXT,
    summary TEXT,
    about TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    nice_to_have JSONB DEFAULT '[]'::jsonb,
    open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    label TEXT,
    section TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 99,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author_name TEXT,
    author_title TEXT,
    author_company TEXT,
    published BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 99,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    featured BOOLEAN DEFAULT false,
    stat_1_val TEXT,
    stat_1_lbl TEXT,
    stat_2_val TEXT,
    stat_2_lbl TEXT,
    stat_3_val TEXT,
    stat_3_lbl TEXT,
    sort_order INTEGER DEFAULT 99,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'user'))
);

-- ==========================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_call_token ON leads(call_token);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event ON webhook_events(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_cal_event_id ON meetings(cal_event_id);
CREATE INDEX IF NOT EXISTS idx_manual_tasks_lead_id ON manual_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_manual_tasks_status_priority ON manual_tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_lookup ON rate_limit_log(ip_address, phone, email, created_at DESC);

-- ==========================================
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE OR REPLACE TRIGGER update_meetings_modtime BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) & AUTHORIZATION
-- ==========================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin Status
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES: leads
-- Public can ONLY insert new leads (read/update/delete blocked)
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access leads" ON leads FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS POLICIES: Core system tables (Admin & Service Role ONLY)
CREATE POLICY "Admin full access webhook_events" ON webhook_events FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access call_logs" ON call_logs FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access meetings" ON meetings FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access communication_logs" ON communication_logs FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access manual_tasks" ON manual_tasks FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access error_logs" ON error_logs FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access rate_limit_log" ON rate_limit_log FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access user_roles" ON user_roles FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS POLICIES: Public CMS (Read-only for public, admin full access)
CREATE POLICY "Public select posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access posts" ON posts FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Public select projects" ON projects FOR SELECT USING (published = true);
CREATE POLICY "Admin full access projects" ON projects FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Public select roles" ON roles FOR SELECT USING (open = true);
CREATE POLICY "Admin full access roles" ON roles FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Public select site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin full access site_content" ON site_content FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Public select faq_items" ON faq_items FOR SELECT USING (published = true);
CREATE POLICY "Admin full access faq_items" ON faq_items FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Public select testimonials" ON testimonials FOR SELECT USING (published = true);
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Public select services" ON services FOR SELECT USING (published = true);
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ==========================================
-- ATOMIC RATE LIMIT COUNTERS & RPC FUNCTION
-- ==========================================

CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key_type TEXT NOT NULL,
  key_value TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key_type, key_value, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_counters(window_start);

-- Additional Enterprise Performance & Scale Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_call_token ON leads(call_token) WHERE call_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event ON webhook_events(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access rate_limit_counters" ON rate_limit_counters FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key_type TEXT,
  p_key_value TEXT,
  p_action TEXT,
  p_max_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  v_window_start := to_timestamp(floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds);

  INSERT INTO rate_limit_counters (key_type, key_value, action, window_start, request_count)
  VALUES (p_key_type, p_key_value, p_action, v_window_start, 1)
  ON CONFLICT (key_type, key_value, action, window_start)
  DO UPDATE SET request_count = rate_limit_counters.request_count + 1
  RETURNING request_count INTO v_current_count;

  v_allowed := (v_current_count <= p_max_limit);

  IF NOT v_allowed THEN
    INSERT INTO rate_limit_log (ip_address, phone, email, action, created_at)
    VALUES (
      CASE WHEN p_key_type = 'ip' THEN p_key_value ELSE NULL END,
      CASE WHEN p_key_type = 'phone' THEN p_key_value ELSE NULL END,
      CASE WHEN p_key_type = 'email' THEN p_key_value ELSE NULL END,
      p_action || '_breach',
      v_now
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'max_limit', p_max_limit,
    'window_start', v_window_start,
    'reset_seconds', extract(epoch from (v_window_start + (p_window_seconds || ' seconds')::interval - v_now))::integer
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- LOG RETENTION & AUTOMATED CLEANUP FUNCTION
-- Retention Policy:
-- rate_limit_log: 30 days
-- webhook_events: 90 days
-- error_logs: 90 days
-- activity_logs: 180 days
-- ==========================================

CREATE OR REPLACE FUNCTION cleanup_expired_logs()
RETURNS JSONB AS $$
DECLARE
  v_rate_limit_deleted INTEGER;
  v_webhook_deleted INTEGER;
  v_error_deleted INTEGER;
  v_activity_deleted INTEGER;
BEGIN
  DELETE FROM rate_limit_log WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_rate_limit_deleted = ROW_COUNT;

  DELETE FROM rate_limit_counters WHERE window_start < now() - INTERVAL '7 days';

  DELETE FROM webhook_events WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_webhook_deleted = ROW_COUNT;

  DELETE FROM error_logs WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_error_deleted = ROW_COUNT;

  DELETE FROM activity_logs WHERE created_at < now() - INTERVAL '180 days';
  GET DIAGNOSTICS v_activity_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'rate_limit_deleted', v_rate_limit_deleted,
    'webhook_deleted', v_webhook_deleted,
    'error_deleted', v_error_deleted,
    'activity_deleted', v_activity_deleted
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- LEAD ACTIVITIES & TIMELINE ENGINE
-- ==========================================

CREATE TABLE IF NOT EXISTS lead_activities (
  id TEXT PRIMARY KEY DEFAULT ('act-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 6)),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'intake_created', 'call_requested', 'status_changed', 'note_added', 'qualification_updated'
  description TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id, created_at DESC);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access lead_activities" ON lead_activities FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ==========================================
-- SCHEMA MIGRATIONS & COLUMN RECOVERY
-- ==========================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_token TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_token_expires_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_token_used BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_uid TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_recording_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_temperature TEXT DEFAULT 'warm';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_booked BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_time TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_ip TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_user_agent TEXT;


