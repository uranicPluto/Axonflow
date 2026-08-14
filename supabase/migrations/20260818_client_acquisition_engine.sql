-- ==============================================================================
-- Migration: 20260818_client_acquisition_engine.sql
-- Description: Schema for Autonomous Client Acquisition Engine & Pipeline Acceleration
-- ==============================================================================

-- 1. Table: account_priorities
CREATE TABLE IF NOT EXISTS account_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 50, -- 0-100
    tier TEXT NOT NULL, -- 'Tier 1' | 'Tier 2' | 'Tier 3'
    reasoning JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_priorities_lead ON account_priorities(lead_id);
CREATE INDEX IF NOT EXISTS idx_account_priorities_tier ON account_priorities(tier);
ALTER TABLE account_priorities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access account_priorities" ON account_priorities;
CREATE POLICY "Admin full access account_priorities" ON account_priorities FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: reactivation_opportunities
CREATE TABLE IF NOT EXISTS reactivation_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    reactivation_probability INTEGER DEFAULT 50, -- 0-100
    outreach_strategy TEXT NOT NULL,
    recommended_offer TEXT NOT NULL,
    next_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reactivation_opportunities_lead ON reactivation_opportunities(lead_id);
ALTER TABLE reactivation_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access reactivation_opportunities" ON reactivation_opportunities;
CREATE POLICY "Admin full access reactivation_opportunities" ON reactivation_opportunities FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: champion_reports
CREATE TABLE IF NOT EXISTS champion_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    champion_name TEXT NOT NULL,
    influence_score INTEGER DEFAULT 70,
    relationship_strength TEXT DEFAULT 'Strong', -- 'Strong' | 'Moderate' | 'Weak'
    engagement_plan JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_champion_reports_lead ON champion_reports(lead_id);
ALTER TABLE champion_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access champion_reports" ON champion_reports;
CREATE POLICY "Admin full access champion_reports" ON champion_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: stakeholder_coverage_reports
CREATE TABLE IF NOT EXISTS stakeholder_coverage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    coverage_score INTEGER DEFAULT 50, -- 0-100
    risks JSONB DEFAULT '[]'::jsonb,
    missing_stakeholders JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stakeholder_coverage_reports_lead ON stakeholder_coverage_reports(lead_id);
ALTER TABLE stakeholder_coverage_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access stakeholder_coverage_reports" ON stakeholder_coverage_reports;
CREATE POLICY "Admin full access stakeholder_coverage_reports" ON stakeholder_coverage_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: pipeline_analysis_reports
CREATE TABLE IF NOT EXISTS pipeline_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_concentration JSONB DEFAULT '{}'::jsonb,
    stage_distribution JSONB DEFAULT '{}'::jsonb,
    revenue_target_gap NUMERIC(12,2) DEFAULT 0,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pipeline_analysis_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access pipeline_analysis_reports" ON pipeline_analysis_reports;
CREATE POLICY "Admin full access pipeline_analysis_reports" ON pipeline_analysis_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));
