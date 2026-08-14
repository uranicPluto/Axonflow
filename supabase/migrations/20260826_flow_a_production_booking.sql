-- Migration 20260826: Flow A Phase 1 Production Booking Capture Schema
-- Ensures webhook_events, communication_logs, meetings, and leads match exact Flow A specifications

-- 1. Create or update webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text,
  payload jsonb,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  lead_id text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_provider_event 
  ON webhook_events(provider, provider_event_id);

-- 2. Create or update communication_logs table
CREATE TABLE IF NOT EXISTS communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text,
  channel text NOT NULL, -- 'whatsapp' | 'email'
  recipient text NOT NULL,
  message_type text,
  status text DEFAULT 'sent', -- 'sent' | 'failed' | 'delivered'
  provider_message_id text,
  idempotency_key text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_logs_lead_id ON communication_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_idempotency ON communication_logs(idempotency_key);

-- 3. Create or update meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  cal_uid text NOT NULL,
  cal_booking_uid text,
  scheduled_at timestamptz NOT NULL,
  meeting_link text,
  status text DEFAULT 'scheduled', -- 'scheduled' | 'rescheduled' | 'cancelled'
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_cal_uid ON meetings(cal_uid);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);

-- 4. Ensure leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
