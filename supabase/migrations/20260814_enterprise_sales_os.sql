-- ==============================================================================
-- Migration: 20260814_enterprise_sales_os.sql
-- Description: Schema for Lead Enrichment, Company Research, Meeting Outcomes, Proposal Intelligence, and AI Lead Scoring Engine
-- ==============================================================================

-- 1. Table: lead_enrichment_reports
CREATE TABLE IF NOT EXISTS lead_enrichment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    industry TEXT,
    company_size TEXT,
    annual_revenue_estimate TEXT,
    employee_count INTEGER,
    location TEXT,
    linkedin_url TEXT,
    website TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    funding_stage TEXT,
    raw_enrichment_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_enrichment_lead_id ON lead_enrichment_reports(lead_id);
ALTER TABLE lead_enrichment_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access lead_enrichment_reports" ON lead_enrichment_reports;
CREATE POLICY "Admin full access lead_enrichment_reports" ON lead_enrichment_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: company_research_reports
CREATE TABLE IF NOT EXISTS company_research_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    company_summary TEXT NOT NULL,
    competitive_landscape TEXT NOT NULL,
    growth_signals TEXT NOT NULL,
    risk_factors TEXT NOT NULL,
    buying_signals TEXT NOT NULL,
    recommended_pitch TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_research_lead_id ON company_research_reports(lead_id);
ALTER TABLE company_research_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access company_research_reports" ON company_research_reports;
CREATE POLICY "Admin full access company_research_reports" ON company_research_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: meeting_outcomes
CREATE TABLE IF NOT EXISTS meeting_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    meeting_notes TEXT NOT NULL,
    budget NUMERIC(12,2),
    budget_confidence TEXT DEFAULT 'estimated', -- 'confirmed' | 'estimated' | 'unknown'
    timeline TEXT,
    decision_makers TEXT,
    pain_points_confirmed TEXT,
    next_steps TEXT,
    ai_summary TEXT,
    recommended_next_action TEXT,
    score_delta INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_outcomes_lead_id ON meeting_outcomes(lead_id);
ALTER TABLE meeting_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access meeting_outcomes" ON meeting_outcomes;
CREATE POLICY "Admin full access meeting_outcomes" ON meeting_outcomes FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: proposal_recommendations
CREATE TABLE IF NOT EXISTS proposal_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    recommended_package TEXT NOT NULL,
    estimated_price_range TEXT NOT NULL,
    implementation_timeline TEXT NOT NULL,
    project_scope TEXT NOT NULL,
    expected_roi TEXT NOT NULL,
    deliverables JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft', -- 'draft' | 'approved' | 'sent'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_recommendations_lead_id ON proposal_recommendations(lead_id);
ALTER TABLE proposal_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access proposal_recommendations" ON proposal_recommendations;
CREATE POLICY "Admin full access proposal_recommendations" ON proposal_recommendations FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: lead_scores
CREATE TABLE IF NOT EXISTS lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),
    category TEXT NOT NULL CHECK (category IN ('Hot', 'Warm', 'Cold')),
    questionnaire_score INTEGER DEFAULT 0,
    company_fit_score INTEGER DEFAULT 0,
    urgency_score INTEGER DEFAULT 0,
    budget_score INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    discovery_outcome_score INTEGER DEFAULT 0,
    score_breakdown_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_total ON lead_scores(total_score DESC);
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access lead_scores" ON lead_scores;
CREATE POLICY "Admin full access lead_scores" ON lead_scores FOR ALL TO authenticated USING (is_admin(auth.uid()));
