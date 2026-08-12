-- ==================================================
-- HOUSE OF WORKFLOW DATABASE SCHEMA - BOOKINGS TABLE
-- Cal.com Integration Support
-- ==================================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    cal_booking_id BIGINT UNIQUE, -- Cal.com booking ID
    event_type_id INTEGER,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reschedule_url TEXT,
    cancel_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Apply modified_at trigger
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin full access bookings" ON public.bookings FOR ALL TO authenticated USING (is_admin(auth.uid()));
