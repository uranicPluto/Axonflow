-- ====================================================================
-- AXONFLOW COMMUNICATION LOG IDEMPOTENCY KEY (Phase 18 Flow A)
-- Database: PostgreSQL / Supabase
-- Target Release: 2026-08-12
-- ====================================================================

-- Add unique idempotency_key column to prevent duplicate outbound messages
ALTER TABLE communication_logs ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
