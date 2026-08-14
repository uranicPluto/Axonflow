-- Migration 20260825: Revenue Engine Workflows A & B Schema Extensions
-- Extends leads, meetings, meeting_briefs, and transcripts for complete Book-a-Call & Experience Service flows

-- 1. Ensure required columns in leads table
ALTER TABLE IF EXISTS leads
  ADD COLUMN IF NOT EXISTS cal_booking_uid text,
  ADD COLUMN IF NOT EXISTS meeting_timezone text DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS fit_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intent_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recommended_service text,
  ADD COLUMN IF NOT EXISTS founder_talking_points text,
  ADD COLUMN IF NOT EXISTS reschedule_requested boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reschedule_preferred_slot text;

-- 2. Ensure required columns in meetings table
ALTER TABLE IF EXISTS meetings
  ADD COLUMN IF NOT EXISTS cal_booking_uid text,
  ADD COLUMN IF NOT EXISTS meeting_timezone text DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS meeting_status text DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;

-- 3. Ensure required columns in meeting_briefs table
ALTER TABLE IF EXISTS meeting_briefs
  ADD COLUMN IF NOT EXISTS fit_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intent_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overall_lead_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recommended_service text,
  ADD COLUMN IF NOT EXISTS founder_talking_points text,
  ADD COLUMN IF NOT EXISTS call_transcript text;

-- 4. Create index on cal_booking_uid for fast lookup
CREATE INDEX IF NOT EXISTS idx_leads_cal_booking_uid ON leads(cal_booking_uid);
CREATE INDEX IF NOT EXISTS idx_meetings_cal_booking_uid ON meetings(cal_booking_uid);
