-- ==========================================
-- HOUSE OF WORKFLOW DATABASE SCHEMA
-- Version 1.0 — August 2026
-- Supabase / PostgreSQL
-- ==========================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing tables if needed (uncomment for clean reset)
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS testimonials CASCADE;
-- DROP TABLE IF EXISTS faq_items CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS site_content CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS posts CASCADE;
-- DROP TABLE IF EXISTS call_logs CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;

-- 1. Table: leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    source TEXT, -- 'book_a_call' | 'experience_form'
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT, -- 'web_dev' | 'ai_automation' | 'both' | 'not_sure'
    problem_description TEXT,
    status TEXT DEFAULT 'new', -- 'new' | 'in_progress' | 'meeting_booked' | 'won' | 'archived'
    internal_notes TEXT,
    lead_score INTEGER, -- 1–10
    lead_score_reason TEXT,
    pain_points TEXT,
    budget_signal TEXT,
    business_type TEXT,
    call_attempted_at TIMESTAMPTZ,
    call_answered BOOLEAN,
    call_transcript TEXT,
    call_attempts INTEGER DEFAULT 0,
    call_outcome TEXT, -- 'booked' | 'no_answer' | 'not_interested' | 'callback_requested'
    meeting_datetime TIMESTAMPTZ,
    meeting_link TEXT,
    meeting_confirmed BOOLEAN DEFAULT false,
    calendly_event_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table: call_logs
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    call_provider TEXT, -- 'bolna'
    call_sid TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_sec INTEGER,
    outcome TEXT, -- 'answered' | 'no_answer' | 'voicemail' | 'failed'
    transcript TEXT,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table: posts (Blog)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    read_time TEXT,
    author TEXT DEFAULT 'Jay Mahajan',
    excerpt TEXT,
    body TEXT, -- Markdown or rich text HTML
    status TEXT DEFAULT 'draft', -- 'published' | 'draft'
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table: projects (Portfolio)
CREATE TABLE projects (
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

-- 5. Table: roles (Careers)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    team TEXT,
    location TEXT DEFAULT 'Pune, India (Remote-friendly)',
    type TEXT, -- 'full-time' | 'part-time' | 'contract' | 'internship'
    salary_range TEXT,
    summary TEXT,
    about TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb, -- array of strings
    requirements JSONB DEFAULT '[]'::jsonb, -- array of strings
    nice_to_have JSONB DEFAULT '[]'::jsonb, -- array of strings
    open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Table: site_content (Homepage CMS)
CREATE TABLE site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- 'text' | 'url' | 'number' | 'html'
    label TEXT,
    section TEXT, -- 'hero' | 'problem' | 'video' | 'services' | 'team' | 'faq' | 'footer'
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Table: faq_items
CREATE TABLE faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 99,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Table: testimonials
CREATE TABLE testimonials (
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

-- 9. Table: services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT, -- '01', '02', etc.
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

-- 10. Table: user_roles
CREATE TABLE user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'user'))
);

-- ==========================================
-- AUTOMATIC TIMESTAMPS
-- ==========================================

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_posts_modtime BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_site_content_modtime BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_faq_items_modtime BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_testimonials_modtime BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable Row Level Security on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies: posts
CREATE POLICY "Public select published posts" ON posts
    FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access posts" ON posts
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: projects
CREATE POLICY "Public select published projects" ON projects
    FOR SELECT USING (published = true);
CREATE POLICY "Admin full access projects" ON projects
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: roles
CREATE POLICY "Public select open roles" ON roles
    FOR SELECT USING (open = true);
CREATE POLICY "Admin full access roles" ON roles
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: site_content
CREATE POLICY "Public select all site_content" ON site_content
    FOR SELECT USING (true);
CREATE POLICY "Admin full access site_content" ON site_content
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: faq_items
CREATE POLICY "Public select published faqs" ON faq_items
    FOR SELECT USING (published = true);
CREATE POLICY "Admin full access faqs" ON faq_items
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: testimonials
CREATE POLICY "Public select published testimonials" ON testimonials
    FOR SELECT USING (published = true);
CREATE POLICY "Admin full access testimonials" ON testimonials
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: services
CREATE POLICY "Public select published services" ON services
    FOR SELECT USING (published = true);
CREATE POLICY "Admin full access services" ON services
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: leads
CREATE POLICY "Public insert leads" ON leads
    FOR INSERT WITH CHECK (true); -- Anyone can submit a lead form
CREATE POLICY "Admin full access leads" ON leads
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: call_logs
CREATE POLICY "Admin full access call_logs" ON call_logs
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies: user_roles
CREATE POLICY "Admin full access user_roles" ON user_roles
    FOR ALL TO authenticated USING (is_admin(auth.uid()));
