-- ==============================================================================
-- Migration: 20260820_growth_market_intelligence.sql
-- Description: Schema for Phase 16 Autonomous Growth & Market Intelligence Platform
-- ==============================================================================

-- 1. Table: market_intelligence_reports
CREATE TABLE IF NOT EXISTS market_intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry TEXT NOT NULL,
    market_size NUMERIC(14,2) DEFAULT 10000000.00,
    growth_rate NUMERIC(5,2) DEFAULT 18.5,
    opportunity_score INTEGER DEFAULT 85,
    summary TEXT NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_reports_industry ON market_intelligence_reports(industry);
ALTER TABLE market_intelligence_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access market_intelligence_reports" ON market_intelligence_reports;
CREATE POLICY "Admin full access market_intelligence_reports" ON market_intelligence_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: competitor_intelligence
CREATE TABLE IF NOT EXISTS competitor_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_name TEXT NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    offerings JSONB DEFAULT '[]'::jsonb,
    pricing_position TEXT DEFAULT 'Mid-Market Premium',
    market_share_estimate NUMERIC(5,2) DEFAULT 12.0,
    threat_score INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_intelligence_name ON competitor_intelligence(competitor_name);
ALTER TABLE competitor_intelligence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access competitor_intelligence" ON competitor_intelligence;
CREATE POLICY "Admin full access competitor_intelligence" ON competitor_intelligence FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: expansion_opportunities
CREATE TABLE IF NOT EXISTS expansion_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry TEXT NOT NULL,
    service TEXT NOT NULL,
    estimated_revenue NUMERIC(12,2) DEFAULT 0,
    confidence INTEGER DEFAULT 85,
    priority TEXT DEFAULT 'High', -- 'High' | 'Medium' | 'Low'
    reasoning JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expansion_opportunities_industry ON expansion_opportunities(industry);
ALTER TABLE expansion_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access expansion_opportunities" ON expansion_opportunities;
CREATE POLICY "Admin full access expansion_opportunities" ON expansion_opportunities FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: growth_initiatives
CREATE TABLE IF NOT EXISTS growth_initiatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact_score INTEGER DEFAULT 85,
    effort_score INTEGER DEFAULT 40,
    priority TEXT DEFAULT 'High', -- 'High' | 'Medium' | 'Low'
    status TEXT DEFAULT 'planned', -- 'planned' | 'in_progress' | 'completed'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE growth_initiatives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access growth_initiatives" ON growth_initiatives;
CREATE POLICY "Admin full access growth_initiatives" ON growth_initiatives FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: strategic_alerts
CREATE TABLE IF NOT EXISTS strategic_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'competitor_threat' | 'market_shift' | 'concentration_risk' | 'industry_slowdown' | 'new_opportunity'
    severity TEXT NOT NULL, -- 'Low' | 'Medium' | 'High' | 'Critical'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strategic_alerts_severity ON strategic_alerts(severity);
ALTER TABLE strategic_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access strategic_alerts" ON strategic_alerts;
CREATE POLICY "Admin full access strategic_alerts" ON strategic_alerts FOR ALL TO authenticated USING (is_admin(auth.uid()));
