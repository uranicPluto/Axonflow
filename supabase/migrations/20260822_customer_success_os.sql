-- ==============================================================================
-- Migration: 20260822_customer_success_os.sql
-- Description: Schema for Phase 18 Client Delivery Intelligence & Customer Success OS
-- ==============================================================================

-- 1. Table: client_onboarding_reports
CREATE TABLE IF NOT EXISTS client_onboarding_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    onboarding_status TEXT DEFAULT 'in_progress', -- 'not_started' | 'in_progress' | 'completed' | 'delayed'
    implementation_readiness TEXT DEFAULT 'High',
    readiness_score INTEGER DEFAULT 88,
    timeline_estimate TEXT DEFAULT '14 Days',
    risk_factors JSONB DEFAULT '[]'::jsonb,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_onboarding_reports_name ON client_onboarding_reports(client_name);
ALTER TABLE client_onboarding_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access client_onboarding_reports" ON client_onboarding_reports;
CREATE POLICY "Admin full access client_onboarding_reports" ON client_onboarding_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: delivery_health_reports
CREATE TABLE IF NOT EXISTS delivery_health_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    health_score INTEGER DEFAULT 90,
    status TEXT DEFAULT 'Healthy', -- 'Healthy' | 'Watch' | 'Risk' | 'Critical'
    project_momentum TEXT DEFAULT 'Strong',
    risks JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_health_reports_status ON delivery_health_reports(status);
ALTER TABLE delivery_health_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access delivery_health_reports" ON delivery_health_reports;
CREATE POLICY "Admin full access delivery_health_reports" ON delivery_health_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: customer_health_scores
CREATE TABLE IF NOT EXISTS customer_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    health_score INTEGER DEFAULT 92,
    health_category TEXT DEFAULT 'Healthy', -- 'Champion' | 'Healthy' | 'Watch' | 'Risk' | 'Churn Risk'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_health_scores_category ON customer_health_scores(health_category);
ALTER TABLE customer_health_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access customer_health_scores" ON customer_health_scores;
CREATE POLICY "Admin full access customer_health_scores" ON customer_health_scores FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: expansion_opportunities
CREATE TABLE IF NOT EXISTS expansion_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    opportunity_type TEXT NOT NULL, -- 'upsell' | 'cross_sell' | 'new_department' | 'additional_automation'
    expected_revenue_impact NUMERIC(12,2) DEFAULT 0,
    confidence INTEGER DEFAULT 85,
    recommended_offer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expansion_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access expansion_opportunities" ON expansion_opportunities;
CREATE POLICY "Admin full access expansion_opportunities" ON expansion_opportunities FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: renewal_forecasts
CREATE TABLE IF NOT EXISTS renewal_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    renewal_probability INTEGER DEFAULT 90,
    expansion_probability INTEGER DEFAULT 75,
    churn_probability INTEGER DEFAULT 10,
    arr_at_risk NUMERIC(12,2) DEFAULT 0,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE renewal_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access renewal_forecasts" ON renewal_forecasts;
CREATE POLICY "Admin full access renewal_forecasts" ON renewal_forecasts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 6. Table: customer_sentiment_reports
CREATE TABLE IF NOT EXISTS customer_sentiment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    sentiment_category TEXT DEFAULT 'Positive', -- 'Positive' | 'Neutral' | 'Negative'
    sentiment_score INTEGER DEFAULT 88,
    trend TEXT DEFAULT 'Improving',
    risk_indicators JSONB DEFAULT '[]'::jsonb,
    advocacy_indicators JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customer_sentiment_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access customer_sentiment_reports" ON customer_sentiment_reports;
CREATE POLICY "Admin full access customer_sentiment_reports" ON customer_sentiment_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 7. Table: customer_success_actions
CREATE TABLE IF NOT EXISTS customer_success_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    priority TEXT DEFAULT 'High', -- 'High' | 'Medium' | 'Low'
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customer_success_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access customer_success_actions" ON customer_success_actions;
CREATE POLICY "Admin full access customer_success_actions" ON customer_success_actions FOR ALL TO authenticated USING (is_admin(auth.uid()));
