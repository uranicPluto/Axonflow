-- ==============================================================================
-- Migration: 20260814_ai_meeting_prep.sql
-- Description: Automated AI Meeting Preparation System & Questionnaire Tables
-- ==============================================================================

-- 1. Ensure meeting_briefs table exists with required fields
CREATE TABLE IF NOT EXISTS meeting_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    lead_email TEXT NOT NULL,
    company_name TEXT,
    company_website TEXT,
    research_summary TEXT,
    key_pain_points TEXT,
    opportunities TEXT,
    discovery_questions TEXT,
    recommended_offer TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure missing columns are added safely if table pre-existed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='meeting_briefs' AND column_name='recommended_offer'
    ) THEN
        ALTER TABLE meeting_briefs ADD COLUMN recommended_offer TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='meeting_briefs' AND column_name='booking_id'
    ) THEN
        ALTER TABLE meeting_briefs ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Performance Indexes for meeting_briefs
CREATE INDEX IF NOT EXISTS idx_meeting_briefs_lead_id ON meeting_briefs(lead_id);
CREATE INDEX IF NOT EXISTS idx_meeting_briefs_booking_id ON meeting_briefs(booking_id);

-- RLS Security for meeting_briefs
ALTER TABLE meeting_briefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access meeting_briefs" ON meeting_briefs;
CREATE POLICY "Admin full access meeting_briefs" ON meeting_briefs FOR ALL TO authenticated USING (is_admin(auth.uid()));


-- 2. Create pre_call_questionnaires table
CREATE TABLE IF NOT EXISTS pre_call_questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    lead_email TEXT NOT NULL,
    bottleneck TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    team_size TEXT NOT NULL,
    goal_90_days TEXT NOT NULL,
    booking_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes for pre_call_questionnaires
CREATE INDEX IF NOT EXISTS idx_pre_call_questionnaires_lead_id ON pre_call_questionnaires(lead_id);
CREATE INDEX IF NOT EXISTS idx_pre_call_questionnaires_email ON pre_call_questionnaires(lead_email);

-- RLS Security for pre_call_questionnaires
ALTER TABLE pre_call_questionnaires ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert pre_call_questionnaires" ON pre_call_questionnaires;
CREATE POLICY "Public insert pre_call_questionnaires" ON pre_call_questionnaires FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access pre_call_questionnaires" ON pre_call_questionnaires;
CREATE POLICY "Admin full access pre_call_questionnaires" ON pre_call_questionnaires FOR ALL TO authenticated USING (is_admin(auth.uid()));
