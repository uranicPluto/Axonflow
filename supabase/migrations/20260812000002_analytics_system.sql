-- ====================================================================
-- AXONFLOW BUSINESS INTELLIGENCE & REVENUE ANALYTICS MIGRATION (Phase 16)
-- Database: PostgreSQL / Supabase
-- Target Release: 2026-08-12
-- ====================================================================

-- 1. CLEAN RESET HELPER
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS lead_scores CASCADE;
DROP TABLE IF EXISTS daily_metrics CASCADE;

-- 2. ANALYTICS EVENTS TABLE
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY DEFAULT ('evt-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 6)),
  event_type TEXT NOT NULL, -- 'new_lead', 'call_requested', 'qualified', 'proposal_sent', 'won', 'lost'
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'direct',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_type_lead ON analytics_events(event_type, lead_id);

-- 3. LEAD SCORES TABLE
CREATE TABLE lead_scores (
  id TEXT PRIMARY KEY DEFAULT ('scr-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 6)),
  lead_id UUID UNIQUE NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  classification TEXT NOT NULL CHECK (classification IN ('Cold', 'Warm', 'Hot', 'Priority')),
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_scores_score_class ON lead_scores(score DESC, classification);

-- 4. DAILY METRICS AGGREGATION TABLE
CREATE TABLE daily_metrics (
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

CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin Status (re-use from schema if exists)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Policies
CREATE POLICY "Admin full access analytics_events" ON analytics_events FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access lead_scores" ON lead_scores FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin full access daily_metrics" ON daily_metrics FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ==========================================
-- AUTOMATION TRIGGER: LEAD FUNNEL EVENTS
-- ==========================================

CREATE OR REPLACE FUNCTION log_lead_funnel_event()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
BEGIN
  -- Determine event type based on lead status
  IF TG_OP = 'INSERT' THEN
    v_event_type := CASE NEW.status
      WHEN 'new' THEN 'new_lead'
      WHEN 'call_opted_in' THEN 'call_requested'
      WHEN 'qualified' THEN 'qualified'
      WHEN 'proposal_sent' THEN 'proposal_sent'
      WHEN 'won' THEN 'won'
      WHEN 'lost' THEN 'lost'
      ELSE 'new_lead'
    END;
    
    INSERT INTO analytics_events (event_type, lead_id, source, metadata)
    VALUES (v_event_type, NEW.id, COALESCE(NEW.source, 'direct'), jsonb_build_object(
      'utm_source', NEW.utm_source,
      'utm_medium', NEW.utm_medium,
      'utm_campaign', NEW.utm_campaign,
      'referrer', NEW.referrer
    ));
  ELSIF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.call_opted_in IS DISTINCT FROM NEW.call_opted_in) THEN
    -- If status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := CASE NEW.status
        WHEN 'new' THEN 'new_lead'
        WHEN 'call_opted_in' THEN 'call_requested'
        WHEN 'qualified' THEN 'qualified'
        WHEN 'proposal_sent' THEN 'proposal_sent'
        WHEN 'won' THEN 'won'
        WHEN 'lost' THEN 'lost'
        ELSE NULL
      END;
      
      IF v_event_type IS NOT NULL THEN
        INSERT INTO analytics_events (event_type, lead_id, source, metadata)
        VALUES (v_event_type, NEW.id, COALESCE(NEW.source, 'direct'), jsonb_build_object(
          'old_status', OLD.status,
          'new_status', NEW.status,
          'utm_source', NEW.utm_source,
          'utm_medium', NEW.utm_medium,
          'utm_campaign', NEW.utm_campaign
        ));
      END IF;
    END IF;
    
    -- If call_opted_in changed to true
    IF OLD.call_opted_in IS DISTINCT FROM NEW.call_opted_in AND NEW.call_opted_in = true THEN
      -- Check if we already logged call_requested to prevent duplicates
      IF NOT EXISTS (
        SELECT 1 FROM analytics_events 
        WHERE lead_id = NEW.id AND event_type = 'call_requested'
      ) THEN
        INSERT INTO analytics_events (event_type, lead_id, source, metadata)
        VALUES ('call_requested', NEW.id, COALESCE(NEW.source, 'direct'), jsonb_build_object(
          'action', 'call_opt_in_boolean_true'
        ));
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_log_lead_funnel_event
AFTER INSERT OR UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION log_lead_funnel_event();

-- ==========================================
-- AUTOMATION TRIGGER: LEAD SCORING MODEL
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_and_save_lead_score()
RETURNS TRIGGER AS $$
DECLARE
  v_service_score INTEGER := 0;
  v_size_score INTEGER := 0;
  v_budget_score INTEGER := 0;
  v_engagement_score INTEGER := 0;
  v_call_score INTEGER := 0;
  v_source_score INTEGER := 0;
  
  v_total_score INTEGER := 0;
  v_classification TEXT;
  v_breakdown JSONB;
BEGIN
  -- 1. Service Interest (Max 20)
  v_service_score := CASE COALESCE(NEW.service_interest, 'not_sure')
    WHEN 'both' THEN 20
    WHEN 'ai_automation' THEN 15
    WHEN 'web_dev' THEN 10
    ELSE 5
  END;

  -- 2. Company/Team Size (Max 20)
  v_size_score := CASE 
    WHEN NEW.team_size IN ('200+', '51-200', '100+', 'enterprise') THEN 20
    WHEN NEW.team_size IN ('11-50', '10-50', 'mid_size') THEN 15
    WHEN NEW.team_size IN ('1-10', 'small') THEN 5
    ELSE 5
  END;

  -- 3. Budget Signal (Max 25)
  IF NEW.budget_level = 'high' OR NEW.budget_signal LIKE '%1,50,000%' OR NEW.budget_signal LIKE '%150000%' THEN
    v_budget_score := 25;
  ELSIF NEW.budget_level = 'medium' OR NEW.budget_signal LIKE '%50,000%' OR NEW.budget_signal LIKE '%50000%' THEN
    v_budget_score := 15;
  ELSE
    v_budget_score := 5;
  END;

  -- 4. Engagement (Max 15)
  v_engagement_score := 0;
  IF NEW.meeting_confirmed = true THEN
    v_engagement_score := 15;
  ELSIF NEW.meeting_datetime IS NOT NULL THEN
    v_engagement_score := 10;
  ELSIF COALESCE(NEW.call_attempts, 0) > 0 THEN
    v_engagement_score := 5;
  END;

  -- 5. Call Opt-In (Max 10)
  v_call_score := CASE WHEN NEW.call_opted_in = true THEN 10 ELSE 0 END;

  -- 6. Lead Source (Max 10)
  v_source_score := CASE COALESCE(NEW.source, '')
    WHEN 'book_a_call' THEN 10
    WHEN 'experience_form' THEN 5
    ELSE 5
  END;
  
  IF NEW.utm_source IN ('linkedin', 'google_search', 'referral', 'newsletter') THEN
    v_source_score := LEAST(10, v_source_score + 5);
  END IF;

  -- Calculate Total (Base 10 + Factors)
  v_total_score := 10 + v_service_score + v_size_score + v_budget_score + v_engagement_score + v_call_score + v_source_score;
  v_total_score := LEAST(100, v_total_score);

  -- Determine Classification
  v_classification := CASE
    WHEN v_total_score >= 90 THEN 'Priority'
    WHEN v_total_score >= 70 THEN 'Hot'
    WHEN v_total_score >= 40 THEN 'Warm'
    ELSE 'Cold'
  END;

  v_breakdown := jsonb_build_object(
    'service_score', v_service_score,
    'size_score', v_size_score,
    'budget_score', v_budget_score,
    'engagement_score', v_engagement_score,
    'call_score', v_call_score,
    'source_score', v_source_score,
    'base_score', 10
  );

  -- Update/Insert in lead_scores table (use UPSERT)
  INSERT INTO lead_scores (lead_id, score, classification, breakdown, calculated_at)
  VALUES (NEW.id, v_total_score, v_classification, v_breakdown, now())
  ON CONFLICT (lead_id)
  DO UPDATE SET
    score = v_total_score,
    classification = v_classification,
    breakdown = v_breakdown,
    calculated_at = now();

  -- Update leads.lead_score column to remain synchronized
  NEW.lead_score := v_total_score;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_calculate_lead_score
BEFORE INSERT OR UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION calculate_and_save_lead_score();

-- ==========================================
-- DAILY AGGREGATION & REPORTING COMPUTATION
-- ==========================================

CREATE OR REPLACE FUNCTION aggregate_daily_metrics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  v_total_leads INTEGER;
  v_qualified_leads INTEGER;
  v_won_deals INTEGER;
  v_conversion_rate NUMERIC(5, 2);
  v_projected_revenue NUMERIC(12, 2);
  v_source_performance JSONB;
  v_stage_counts JSONB;
  v_metrics_data JSONB;
BEGIN
  -- 1. Total leads created on that day
  SELECT COUNT(*) INTO v_total_leads
  FROM leads
  WHERE created_at::DATE = p_date;

  -- 2. Qualified leads created on that day
  SELECT COUNT(*) INTO v_qualified_leads
  FROM leads
  WHERE created_at::DATE = p_date AND status = 'qualified';

  -- 3. Won deals created on that day
  SELECT COUNT(*) INTO v_won_deals
  FROM leads
  WHERE created_at::DATE = p_date AND status = 'won';

  -- 4. Conversion rate on that day (won / total)
  IF v_total_leads > 0 THEN
    v_conversion_rate := ROUND((v_won_deals::NUMERIC / v_total_leads::NUMERIC) * 100, 2);
  ELSE
    v_conversion_rate := 0.00;
  END IF;

  -- 5. Projected revenue from leads created on that day
  -- Deal values: Won = ₹100,000, Proposal = ₹60,000, Qualified = ₹30,000
  SELECT COALESCE(SUM(
    CASE status
      WHEN 'won' THEN 100000.00
      WHEN 'proposal_sent' THEN 60000.00
      WHEN 'qualified' THEN 30000.00
      ELSE 0.00
    END
  ), 0.00) INTO v_projected_revenue
  FROM leads
  WHERE created_at::DATE = p_date;

  -- 6. Source performance JSON
  SELECT jsonb_object_agg(source_name, count_val) INTO v_source_performance
  FROM (
    SELECT COALESCE(source, 'unknown') as source_name, COUNT(*) as count_val
    FROM leads
    WHERE created_at::DATE = p_date
    GROUP BY COALESCE(source, 'unknown')
  ) s;

  IF v_source_performance IS NULL THEN
    v_source_performance := '{}'::jsonb;
  END IF;

  -- 7. Stage counts JSON
  SELECT jsonb_object_agg(status_name, count_val) INTO v_stage_counts
  FROM (
    SELECT status as status_name, COUNT(*) as count_val
    FROM leads
    WHERE created_at::DATE = p_date
    GROUP BY status
  ) st;

  IF v_stage_counts IS NULL THEN
    v_stage_counts := '{}'::jsonb;
  END IF;

  v_metrics_data := jsonb_build_object(
    'sources', v_source_performance,
    'stages', v_stage_counts,
    'aggregated_at', now()
  );

  -- Upsert daily_metrics
  INSERT INTO daily_metrics (date, total_leads, qualified_leads, won_deals, conversion_rate, projected_revenue, metrics_data, created_at)
  VALUES (p_date, v_total_leads, v_qualified_leads, v_won_deals, v_conversion_rate, v_projected_revenue, v_metrics_data, now())
  ON CONFLICT (date)
  DO UPDATE SET
    total_leads = v_total_leads,
    qualified_leads = v_qualified_leads,
    won_deals = v_won_deals,
    conversion_rate = v_conversion_rate,
    projected_revenue = v_projected_revenue,
    metrics_data = v_metrics_data,
    created_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'date', p_date,
    'total_leads', v_total_leads,
    'projected_revenue', v_projected_revenue
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
