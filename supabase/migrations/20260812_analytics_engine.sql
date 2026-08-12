-- ====================================================================
-- AXONFLOW BUSINESS INTELLIGENCE & REVENUE ANALYTICS MIGRATION
-- Database: PostgreSQL / Supabase
-- Target Release: 2026-08-12
-- ====================================================================

-- 1. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY DEFAULT ('evt-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 6)),
  event_type TEXT NOT NULL, -- 'intake_submitted', 'call_requested', 'status_changed', 'proposal_sent', 'deal_won', 'deal_lost'
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'direct',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_lead ON analytics_events(event_type, lead_id);

-- 2. LEAD SCORES TABLE
CREATE TABLE IF NOT EXISTS lead_scores (
  id TEXT PRIMARY KEY DEFAULT ('scr-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 6)),
  lead_id TEXT UNIQUE NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  classification TEXT NOT NULL CHECK (classification IN ('Cold', 'Warm', 'Hot', 'Priority')),
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_score_class ON lead_scores(score DESC, classification);

-- 3. DAILY METRICS AGGREGATION TABLE
CREATE TABLE IF NOT EXISTS daily_metrics (
  id TEXT PRIMARY KEY DEFAULT ('met-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 6)),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_leads INTEGER NOT NULL DEFAULT 0,
  qualified_leads INTEGER NOT NULL DEFAULT 0,
  won_deals INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  projected_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  metrics_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date DESC);

-- RLS POLICIES
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access analytics_events" ON analytics_events FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access lead_scores" ON lead_scores FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access daily_metrics" ON daily_metrics FOR ALL TO authenticated USING (is_admin(auth.uid()));
