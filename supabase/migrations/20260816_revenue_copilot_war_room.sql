-- ==============================================================================
-- Migration: 20260816_revenue_copilot_war_room.sql
-- Description: Schema for Autonomous Revenue Copilot & Revenue War Room
-- ==============================================================================

-- 1. Table: proposal_engagements
CREATE TABLE IF NOT EXISTS proposal_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposal_recommendations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    first_viewed TIMESTAMPTZ,
    last_viewed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_engagements_lead ON proposal_engagements(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposal_engagements_proposal ON proposal_engagements(proposal_id);
ALTER TABLE proposal_engagements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access proposal_engagements" ON proposal_engagements;
CREATE POLICY "Admin full access proposal_engagements" ON proposal_engagements FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: deal_stakeholders
CREATE TABLE IF NOT EXISTS deal_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    influence_score INTEGER DEFAULT 50,
    champion_score INTEGER DEFAULT 50,
    decision_authority BOOLEAN DEFAULT false,
    sentiment TEXT DEFAULT 'neutral',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_stakeholders_lead ON deal_stakeholders(lead_id);
ALTER TABLE deal_stakeholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access deal_stakeholders" ON deal_stakeholders;
CREATE POLICY "Admin full access deal_stakeholders" ON deal_stakeholders FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: daily_revenue_briefs
CREATE TABLE IF NOT EXISTS daily_revenue_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_text TEXT NOT NULL,
    pipeline_value NUMERIC(12,2) DEFAULT 0,
    likely_revenue NUMERIC(12,2) DEFAULT 0,
    deals_at_risk INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_revenue_briefs_created ON daily_revenue_briefs(created_at DESC);
ALTER TABLE daily_revenue_briefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access daily_revenue_briefs" ON daily_revenue_briefs;
CREATE POLICY "Admin full access daily_revenue_briefs" ON daily_revenue_briefs FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: followup_sequences
CREATE TABLE IF NOT EXISTS followup_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sequence_stage INTEGER DEFAULT 1,
    last_sent_at TIMESTAMPTZ,
    next_scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active', -- 'active' | 'paused' | 'completed'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followup_sequences_lead ON followup_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_sequences_next ON followup_sequences(next_scheduled_at);
ALTER TABLE followup_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access followup_sequences" ON followup_sequences;
CREATE POLICY "Admin full access followup_sequences" ON followup_sequences FOR ALL TO authenticated USING (is_admin(auth.uid()));
