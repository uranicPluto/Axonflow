-- ==============================================================================
-- Migration: 20260819_revenue_operations_platform.sql
-- Description: Schema for Phase 15 Revenue Operations & Executive Intelligence Platform
-- ==============================================================================

-- 1. Table: revenue_forecasts
CREATE TABLE IF NOT EXISTS revenue_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date TIMESTAMPTZ DEFAULT now(),
    committed_revenue NUMERIC(14,2) DEFAULT 0,
    likely_revenue NUMERIC(14,2) DEFAULT 0,
    best_case_revenue NUMERIC(14,2) DEFAULT 0,
    confidence_score INTEGER DEFAULT 80,
    forecast_accuracy NUMERIC(5,2) DEFAULT 92.5,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_date ON revenue_forecasts(forecast_date);
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access revenue_forecasts" ON revenue_forecasts;
CREATE POLICY "Admin full access revenue_forecasts" ON revenue_forecasts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: revenue_targets
CREATE TABLE IF NOT EXISTS revenue_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period TEXT NOT NULL, -- e.g. 'Monthly - Oct 2026' | 'Q4 2026' | 'FY 2026'
    target_revenue NUMERIC(14,2) NOT NULL,
    actual_revenue NUMERIC(14,2) DEFAULT 0,
    attainment_percentage NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_targets_period ON revenue_targets(period);
ALTER TABLE revenue_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access revenue_targets" ON revenue_targets;
CREATE POLICY "Admin full access revenue_targets" ON revenue_targets FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: executive_scorecards
CREATE TABLE IF NOT EXISTS executive_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_health INTEGER DEFAULT 85,
    win_rate NUMERIC(5,2) DEFAULT 42.5,
    average_deal_size NUMERIC(12,2) DEFAULT 8500.00,
    sales_velocity NUMERIC(12,2) DEFAULT 2500.00,
    forecast_accuracy NUMERIC(5,2) DEFAULT 94.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE executive_scorecards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access executive_scorecards" ON executive_scorecards;
CREATE POLICY "Admin full access executive_scorecards" ON executive_scorecards FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: board_reports
CREATE TABLE IF NOT EXISTS board_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_period TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    key_metrics JSONB DEFAULT '{}'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    opportunities JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE board_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access board_reports" ON board_reports;
CREATE POLICY "Admin full access board_reports" ON board_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: optimization_recommendations
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'funnel_bottleneck' | 'lead_quality' | 'forecast_error' | 'concentration_risk'
    recommendation TEXT NOT NULL,
    impact_estimate NUMERIC(12,2) DEFAULT 0,
    confidence INTEGER DEFAULT 85,
    priority TEXT DEFAULT 'High', -- 'High' | 'Medium' | 'Low'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access optimization_recommendations" ON optimization_recommendations;
CREATE POLICY "Admin full access optimization_recommendations" ON optimization_recommendations FOR ALL TO authenticated USING (is_admin(auth.uid()));
