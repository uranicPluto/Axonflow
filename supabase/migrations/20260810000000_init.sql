-- ==================================================
-- HOUSE OF WORKFLOW DATABASE SCHEMA - INITIAL RESET
-- Version 1.0 — August 2026
-- Supabase / PostgreSQL
-- ==================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    source TEXT CHECK (source IN ('book_a_call', 'experience_form', 'manual', 'referral', 'organic', 'paid_ads', 'linkedin', 'other')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT CHECK (service_interest IN ('web_dev', 'ai_automation', 'both', 'not_sure')),
    problem_description TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'qualified', 'meeting_booked', 'meeting_completed', 'proposal', 'won', 'lost', 'not_interested', 'cancelled')),
    internal_notes TEXT,
    lead_score INTEGER,
    lead_score_reason TEXT,
    pain_points TEXT,
    budget_signal TEXT,
    business_type TEXT,
    call_attempted_at TIMESTAMPTZ,
    call_answered BOOLEAN,
    call_transcript TEXT,
    call_attempts INTEGER DEFAULT 0,
    call_outcome TEXT CHECK (call_outcome IN ('booked', 'no_answer', 'not_interested', 'callback_requested')),
    meeting_datetime TIMESTAMPTZ,
    meeting_link TEXT,
    meeting_confirmed BOOLEAN DEFAULT false,
    calendly_event_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table: call_logs
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    call_provider TEXT,
    call_sid TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_sec INTEGER,
    outcome TEXT,
    transcript TEXT,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table: posts (Blog)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    read_time TEXT,
    author TEXT DEFAULT 'Jay Mahajan',
    excerpt TEXT,
    body TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table: projects (Portfolio)
CREATE TABLE IF NOT EXISTS public.projects (
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
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    team TEXT,
    location TEXT DEFAULT 'Pune, India (Remote-friendly)',
    type TEXT CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
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

-- 6. Table: site_content (Homepage CMS)
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    label TEXT,
    section TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Table: faq_items
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 99,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Table: testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
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
CREATE TABLE IF NOT EXISTS public.services (
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

-- 10. Table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'user'))
);

-- ==================================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ==================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_posts_modtime BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_site_content_modtime BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_faq_items_modtime BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_testimonials_modtime BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin check helper
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Select policies
CREATE POLICY "Public select published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public select published projects" ON public.projects FOR SELECT USING (published = true);
CREATE POLICY "Public select open roles" ON public.roles FOR SELECT USING (open = true);
CREATE POLICY "Public select all site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Public select published faqs" ON public.faq_items FOR SELECT USING (published = true);
CREATE POLICY "Public select published testimonials" ON public.testimonials FOR SELECT USING (published = true);
CREATE POLICY "Public select published services" ON public.services FOR SELECT USING (published = true);
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Admin access policies
CREATE POLICY "Admin full access posts" ON public.posts FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access projects" ON public.projects FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access roles" ON public.roles FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access site_content" ON public.site_content FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access faqs" ON public.faq_items FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access testimonials" ON public.testimonials FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access services" ON public.services FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access leads" ON public.leads FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access call_logs" ON public.call_logs FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access user_roles" ON public.user_roles FOR ALL TO authenticated USING (is_admin(auth.uid()));
