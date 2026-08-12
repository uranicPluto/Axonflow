-- ====================================================================
-- AXONFLOW BUSINESS INTELLIGENCE PERFORMANCE INDEXES & OVERRIDES (Phase 17)
-- Database: PostgreSQL / Supabase
-- Target Release: 2026-08-12
-- ====================================================================

-- 1. Query Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source) WHERE utm_source IS NOT NULL;

-- 2. Rework scoring trigger logic to allow manual admin overrides
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
  -- If this is an UPDATE and lead_score was manually modified, preserve the manual value
  IF TG_OP = 'UPDATE' AND NEW.lead_score IS DISTINCT FROM OLD.lead_score THEN
     v_total_score := NEW.lead_score;
     v_classification := CASE
       WHEN v_total_score >= 90 THEN 'Priority'
       WHEN v_total_score >= 70 THEN 'Hot'
       WHEN v_total_score >= 40 THEN 'Warm'
       ELSE 'Cold'
     END;
     v_breakdown := jsonb_build_object(
       'manual_override', true,
       'score', v_total_score
     );
     
     INSERT INTO lead_scores (lead_id, score, classification, breakdown, calculated_at)
     VALUES (NEW.id, v_total_score, v_classification, v_breakdown, now())
     ON CONFLICT (lead_id)
     DO UPDATE SET
       score = v_total_score,
       classification = v_classification,
       breakdown = v_breakdown,
       calculated_at = now();
       
     RETURN NEW;
  END IF;

  -- Otherwise, compute score automatically
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
