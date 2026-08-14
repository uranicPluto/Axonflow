-- ==============================================================================
-- Migration: 20260824_company_operating_system.sql
-- Description: Schema for Phase 20 Autonomous Company Operating System
-- ==============================================================================

-- 1. Table: company_health_reports
CREATE TABLE IF NOT EXISTS company_health_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    overall_score INTEGER NOT NULL DEFAULT 91,
    category TEXT DEFAULT 'Strong', -- 'Exceptional' | 'Strong' | 'Healthy' | 'Watch' | 'Critical'
    revenue_health INTEGER DEFAULT 92,
    pipeline_health INTEGER DEFAULT 88,
    growth_health INTEGER DEFAULT 90,
    customer_health INTEGER DEFAULT 91,
    delivery_health INTEGER DEFAULT 92,
    financial_health INTEGER DEFAULT 93,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_health_reports_score ON company_health_reports(overall_score);
ALTER TABLE company_health_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access company_health_reports" ON company_health_reports;
CREATE POLICY "Admin full access company_health_reports" ON company_health_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: executive_actions
CREATE TABLE IF NOT EXISTS executive_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Revenue', -- 'Revenue' | 'Growth' | 'Finance' | 'Customer Success' | 'Delivery'
    status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'postponed'
    impact TEXT DEFAULT 'High',
    confidence INTEGER DEFAULT 90,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_executive_actions_status ON executive_actions(status);
ALTER TABLE executive_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access executive_actions" ON executive_actions;
CREATE POLICY "Admin full access executive_actions" ON executive_actions FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: decision_recommendations
CREATE TABLE IF NOT EXISTS decision_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    impact TEXT DEFAULT 'High',
    confidence INTEGER DEFAULT 92,
    priority INTEGER DEFAULT 1,
    owner TEXT DEFAULT 'CEO',
    status TEXT DEFAULT 'recommended',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE decision_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access decision_recommendations" ON decision_recommendations;
CREATE POLICY "Admin full access decision_recommendations" ON decision_recommendations FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: strategic_priorities
CREATE TABLE IF NOT EXISTS strategic_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    quarter TEXT DEFAULT 'Q4 2026',
    status TEXT DEFAULT 'on_track',
    impact_score INTEGER DEFAULT 95,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE strategic_priorities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access strategic_priorities" ON strategic_priorities;
CREATE POLICY "Admin full access strategic_priorities" ON strategic_priorities FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: agent_collaborations
CREATE TABLE IF NOT EXISTS agent_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participating_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendation TEXT NOT NULL,
    expected_impact TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_collaborations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access agent_collaborations" ON agent_collaborations;
CREATE POLICY "Admin full access agent_collaborations" ON agent_collaborations FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 6. Table: weekly_ceo_briefs
CREATE TABLE IF NOT EXISTS weekly_ceo_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_health_score INTEGER DEFAULT 91,
    summary TEXT NOT NULL,
    top_opportunities JSONB DEFAULT '[]'::jsonb,
    top_risks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE weekly_ceo_briefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access weekly_ceo_briefs" ON weekly_ceo_briefs;
CREATE POLICY "Admin full access weekly_ceo_briefs" ON weekly_ceo_briefs FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 7. Table: company_objectives
CREATE TABLE IF NOT EXISTS company_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    target_value NUMERIC(12,2) DEFAULT 1000000.0,
    current_value NUMERIC(12,2) DEFAULT 750000.0,
    status TEXT DEFAULT 'on_track',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE company_objectives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access company_objectives" ON company_objectives;
CREATE POLICY "Admin full access company_objectives" ON company_objectives FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 8. Table: objective_progress
CREATE TABLE IF NOT EXISTS objective_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id TEXT NOT NULL,
    progress_percent INTEGER DEFAULT 75,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objective_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access objective_progress" ON objective_progress;
CREATE POLICY "Admin full access objective_progress" ON objective_progress FOR ALL TO authenticated USING (is_admin(auth.uid()));
