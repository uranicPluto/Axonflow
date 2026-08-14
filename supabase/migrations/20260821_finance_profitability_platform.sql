-- ==============================================================================
-- Migration: 20260821_finance_profitability_platform.sql
-- Description: Schema for Phase 17 Finance & Profitability Intelligence Platform
-- ==============================================================================

-- 1. Table: client_profitability_reports
CREATE TABLE IF NOT EXISTS client_profitability_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    revenue NUMERIC(12,2) DEFAULT 0,
    cost NUMERIC(12,2) DEFAULT 0,
    gross_profit NUMERIC(12,2) DEFAULT 0,
    profit_margin NUMERIC(5,2) DEFAULT 0,
    profitability_score INTEGER DEFAULT 85,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_profitability_reports_name ON client_profitability_reports(client_name);
ALTER TABLE client_profitability_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access client_profitability_reports" ON client_profitability_reports;
CREATE POLICY "Admin full access client_profitability_reports" ON client_profitability_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: service_profitability_reports
CREATE TABLE IF NOT EXISTS service_profitability_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    revenue NUMERIC(12,2) DEFAULT 0,
    cost NUMERIC(12,2) DEFAULT 0,
    gross_profit NUMERIC(12,2) DEFAULT 0,
    margin NUMERIC(5,2) DEFAULT 0,
    profitability_score INTEGER DEFAULT 85,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_profitability_reports_name ON service_profitability_reports(service_name);
ALTER TABLE service_profitability_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access service_profitability_reports" ON service_profitability_reports;
CREATE POLICY "Admin full access service_profitability_reports" ON service_profitability_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: cashflow_forecasts
CREATE TABLE IF NOT EXISTS cashflow_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_period TEXT NOT NULL, -- e.g. 'Monthly' | 'Quarterly' | 'Annual'
    projected_revenue NUMERIC(12,2) DEFAULT 0,
    projected_expenses NUMERIC(12,2) DEFAULT 0,
    projected_profit NUMERIC(12,2) DEFAULT 0,
    cash_position NUMERIC(12,2) DEFAULT 0,
    confidence INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cashflow_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access cashflow_forecasts" ON cashflow_forecasts;
CREATE POLICY "Admin full access cashflow_forecasts" ON cashflow_forecasts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: hiring_impact_reports
CREATE TABLE IF NOT EXISTS hiring_impact_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    annual_cost NUMERIC(12,2) DEFAULT 0,
    expected_revenue_impact NUMERIC(12,2) DEFAULT 0,
    expected_profit_impact NUMERIC(12,2) DEFAULT 0,
    payback_period NUMERIC(5,2) DEFAULT 0, -- in months
    recommendation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hiring_impact_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access hiring_impact_reports" ON hiring_impact_reports;
CREATE POLICY "Admin full access hiring_impact_reports" ON hiring_impact_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: financial_alerts
CREATE TABLE IF NOT EXISTS financial_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity TEXT NOT NULL, -- 'Low' | 'Medium' | 'High' | 'Critical'
    type TEXT NOT NULL, -- 'margin_compression' | 'revenue_concentration' | 'high_cac' | 'cash_flow_risk' | 'unprofitable_service' | 'unprofitable_client'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_alerts_severity ON financial_alerts(severity);
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access financial_alerts" ON financial_alerts;
CREATE POLICY "Admin full access financial_alerts" ON financial_alerts FOR ALL TO authenticated USING (is_admin(auth.uid()));
