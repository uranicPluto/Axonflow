-- ==============================================================================
-- Migration: 20260817_deal_execution_system.sql
-- Description: Schema for Autonomous Deal Execution System & AI Deal Room
-- ==============================================================================

-- 1. Table: deal_execution_plans
CREATE TABLE IF NOT EXISTS deal_execution_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    current_status TEXT NOT NULL,
    execution_priority INTEGER DEFAULT 50, -- 1-100
    blockers JSONB DEFAULT '[]'::jsonb,
    opportunities JSONB DEFAULT '[]'::jsonb,
    next_actions JSONB DEFAULT '[]'::jsonb,
    estimated_close_date TIMESTAMPTZ,
    confidence INTEGER DEFAULT 75,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_execution_plans_lead ON deal_execution_plans(lead_id);
ALTER TABLE deal_execution_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access deal_execution_plans" ON deal_execution_plans;
CREATE POLICY "Admin full access deal_execution_plans" ON deal_execution_plans FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: deal_objection_resolutions
CREATE TABLE IF NOT EXISTS deal_objection_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    objection TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    response_strategy TEXT NOT NULL,
    supporting_evidence TEXT NOT NULL,
    recommended_assets JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_objection_resolutions_lead ON deal_objection_resolutions(lead_id);
ALTER TABLE deal_objection_resolutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access deal_objection_resolutions" ON deal_objection_resolutions;
CREATE POLICY "Admin full access deal_objection_resolutions" ON deal_objection_resolutions FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: deal_risk_reports
CREATE TABLE IF NOT EXISTS deal_risk_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0, -- 0-100
    risk_factors JSONB DEFAULT '[]'::jsonb,
    churn_probability INTEGER DEFAULT 0,
    stall_probability INTEGER DEFAULT 0,
    rescue_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_risk_reports_lead ON deal_risk_reports(lead_id);
ALTER TABLE deal_risk_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access deal_risk_reports" ON deal_risk_reports;
CREATE POLICY "Admin full access deal_risk_reports" ON deal_risk_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: deal_timelines
CREATE TABLE IF NOT EXISTS deal_timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    events JSONB DEFAULT '[]'::jsonb,
    momentum_score INTEGER DEFAULT 50, -- 0-100
    days_in_stage INTEGER DEFAULT 0,
    velocity TEXT DEFAULT 'Normal', -- 'High' | 'Normal' | 'Stalled'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_timelines_lead ON deal_timelines(lead_id);
ALTER TABLE deal_timelines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access deal_timelines" ON deal_timelines;
CREATE POLICY "Admin full access deal_timelines" ON deal_timelines FOR ALL TO authenticated USING (is_admin(auth.uid()));
