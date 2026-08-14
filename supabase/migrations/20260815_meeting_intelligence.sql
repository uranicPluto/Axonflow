-- ==============================================================================
-- Migration: 20260815_meeting_intelligence.sql
-- Description: Schema for Meeting Transcripts and AI Meeting Insights
-- ==============================================================================

-- 1. Table: meeting_transcripts
CREATE TABLE IF NOT EXISTS meeting_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    recording_url TEXT,
    transcript TEXT NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_lead ON meeting_transcripts(lead_id);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_created ON meeting_transcripts(created_at DESC);
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access meeting_transcripts" ON meeting_transcripts;
CREATE POLICY "Admin full access meeting_transcripts" ON meeting_transcripts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: meeting_insights
CREATE TABLE IF NOT EXISTS meeting_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES meeting_transcripts(id) ON DELETE CASCADE,
    executive_summary TEXT,
    pain_points JSONB DEFAULT '[]'::jsonb,
    business_goals JSONB DEFAULT '[]'::jsonb,
    objections JSONB DEFAULT '[]'::jsonb,
    buying_signals JSONB DEFAULT '[]'::jsonb,
    competitors_mentioned JSONB DEFAULT '[]'::jsonb,
    stakeholders JSONB DEFAULT '[]'::jsonb,
    budget_signals JSONB DEFAULT '[]'::jsonb,
    urgency_score INTEGER,
    close_probability INTEGER,
    next_actions JSONB DEFAULT '[]'::jsonb,
    sentiment TEXT DEFAULT 'neutral', -- 'positive' | 'neutral' | 'negative'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_insights_lead ON meeting_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_meeting_insights_transcript ON meeting_insights(transcript_id);
CREATE INDEX IF NOT EXISTS idx_meeting_insights_created ON meeting_insights(created_at DESC);
ALTER TABLE meeting_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access meeting_insights" ON meeting_insights;
CREATE POLICY "Admin full access meeting_insights" ON meeting_insights FOR ALL TO authenticated USING (is_admin(auth.uid()));
