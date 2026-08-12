-- ====================================================================
-- AXONFLOW PRODUCTION HARDENING & PERFORMANCE MIGRATION
-- Database: PostgreSQL / Supabase
-- Target Release: 2026-08-12
-- ====================================================================

-- 1. Index for Phone Number Deduplication
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL AND phone != '';

-- 2. Index for Lead Activity Timeline Retrieval
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id, created_at DESC);

-- 3. Index for Retention Purge Queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_created_at ON rate_limit_log(created_at DESC);

-- 4. Check Constraint on Lead Status Enum Values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_leads_status_enum'
    ) THEN
        ALTER TABLE leads 
        ADD CONSTRAINT check_leads_status_enum 
        CHECK (status IN ('new', 'in_progress', 'call_opted_in', 'qualified', 'proposal_sent', 'won', 'lost'));
    END IF;
END $$;
