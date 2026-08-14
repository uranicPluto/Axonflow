-- ==============================================================================
-- Migration: 20260818_autonomous_pipeline_generation.sql
-- Description: Schema for Autonomous Pipeline Generation System (Outbound AI SDR)
-- ==============================================================================

-- 1. Table: prospect_accounts
CREATE TABLE IF NOT EXISTS prospect_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    website TEXT,
    industry TEXT NOT NULL,
    employee_count INTEGER DEFAULT 10,
    annual_revenue_estimate NUMERIC(14,2) DEFAULT 1000000.00,
    headquarters TEXT,
    linkedin_url TEXT,
    source TEXT DEFAULT 'ai_discovery_agent', -- 'linkedin' | 'apollo' | 'crunchbase' | 'clay' | 'clearbit'
    status TEXT DEFAULT 'discovered', -- 'discovered' | 'qualified' | 'converted' | 'archived'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospect_accounts_industry ON prospect_accounts(industry);
CREATE INDEX IF NOT EXISTS idx_prospect_accounts_status ON prospect_accounts(status);
ALTER TABLE prospect_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access prospect_accounts" ON prospect_accounts;
CREATE POLICY "Admin full access prospect_accounts" ON prospect_accounts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: prospect_contacts
CREATE TABLE IF NOT EXISTS prospect_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_account_id UUID REFERENCES prospect_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT,
    linkedin_url TEXT,
    decision_role TEXT DEFAULT 'Decision Maker', -- 'Decision Maker' | 'Champion' | 'Influencer' | 'Blocker'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospect_contacts_account ON prospect_contacts(prospect_account_id);
ALTER TABLE prospect_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access prospect_contacts" ON prospect_contacts;
CREATE POLICY "Admin full access prospect_contacts" ON prospect_contacts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: prospect_research_reports
CREATE TABLE IF NOT EXISTS prospect_research_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_account_id UUID REFERENCES prospect_accounts(id) ON DELETE CASCADE,
    company_summary TEXT NOT NULL,
    pain_points JSONB DEFAULT '[]'::jsonb,
    ai_opportunities JSONB DEFAULT '[]'::jsonb,
    growth_signals JSONB DEFAULT '[]'::jsonb,
    recommended_angle TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospect_research_reports_account ON prospect_research_reports(prospect_account_id);
ALTER TABLE prospect_research_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access prospect_research_reports" ON prospect_research_reports;
CREATE POLICY "Admin full access prospect_research_reports" ON prospect_research_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: intent_signals
CREATE TABLE IF NOT EXISTS intent_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_account_id UUID REFERENCES prospect_accounts(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL, -- 'hiring_ai' | 'hiring_automation' | 'recent_funding' | 'expansion' | 'product_launch' | 'tech_modernization'
    signal_strength INTEGER DEFAULT 50, -- 1-100
    signal_source TEXT DEFAULT 'job_board',
    detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intent_signals_account ON intent_signals(prospect_account_id);
CREATE INDEX IF NOT EXISTS idx_intent_signals_type ON intent_signals(signal_type);
ALTER TABLE intent_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access intent_signals" ON intent_signals;
CREATE POLICY "Admin full access intent_signals" ON intent_signals FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: prospect_scores
CREATE TABLE IF NOT EXISTS prospect_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_account_id UUID REFERENCES prospect_accounts(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 50, -- 0-100
    category TEXT NOT NULL, -- 'Cold' (0-39) | 'Warm' (40-69) | 'Hot' (70-100)
    reasoning JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospect_scores_account ON prospect_scores(prospect_account_id);
CREATE INDEX IF NOT EXISTS idx_prospect_scores_score ON prospect_scores(score DESC);
ALTER TABLE prospect_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access prospect_scores" ON prospect_scores;
CREATE POLICY "Admin full access prospect_scores" ON prospect_scores FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 6. Table: outreach_campaigns
CREATE TABLE IF NOT EXISTS outreach_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_account_id UUID REFERENCES prospect_accounts(id) ON DELETE CASCADE,
    campaign_type TEXT NOT NULL, -- 'cold_email' | 'linkedin_sequence' | 'executive_nudge'
    status TEXT DEFAULT 'drafted', -- 'drafted' | 'active' | 'completed' | 'paused'
    generated_message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_account ON outreach_campaigns(prospect_account_id);
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "Admin full access outreach_campaigns" ON outreach_campaigns FOR ALL TO authenticated USING (is_admin(auth.uid()));
