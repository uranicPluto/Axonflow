-- ==============================================================================
-- Migration: 20260818_autonomous_account_executive.sql
-- Description: Schema for Autonomous Account Executive & Human-in-the-Loop Approval Center
-- ==============================================================================

-- 1. Table: account_executive_plans
CREATE TABLE IF NOT EXISTS account_executive_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 50, -- 1-100
    objective TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    expected_revenue_impact NUMERIC(12,2) DEFAULT 0,
    confidence INTEGER DEFAULT 80,
    execution_steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_executive_plans_lead ON account_executive_plans(lead_id);
ALTER TABLE account_executive_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access account_executive_plans" ON account_executive_plans;
CREATE POLICY "Admin full access account_executive_plans" ON account_executive_plans FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: outreach_packages
CREATE TABLE IF NOT EXISTS outreach_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'follow_up' | 'proposal_reminder' | 'executive_escalation' | 'stakeholder_intro' | 'contract_push' | 'breakup'
    subject TEXT NOT NULL,
    email_body TEXT NOT NULL,
    sms_body TEXT,
    linkedin_message TEXT,
    call_script TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_packages_lead ON outreach_packages(lead_id);
ALTER TABLE outreach_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access outreach_packages" ON outreach_packages;
CREATE POLICY "Admin full access outreach_packages" ON outreach_packages FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: sales_cadences
CREATE TABLE IF NOT EXISTS sales_cadences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    current_stage TEXT NOT NULL,
    next_touch_date TIMESTAMPTZ,
    next_action TEXT NOT NULL,
    sequence_progress INTEGER DEFAULT 0, -- percentage 0-100
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_cadences_lead ON sales_cadences(lead_id);
ALTER TABLE sales_cadences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access sales_cadences" ON sales_cadences;
CREATE POLICY "Admin full access sales_cadences" ON sales_cadences FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: response_analyses
CREATE TABLE IF NOT EXISTS response_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sentiment TEXT DEFAULT 'neutral',
    intent INTEGER DEFAULT 50,
    urgency TEXT DEFAULT 'Normal',
    buying_signals JSONB DEFAULT '[]'::jsonb,
    objections JSONB DEFAULT '[]'::jsonb,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_response_analyses_lead ON response_analyses(lead_id);
ALTER TABLE response_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access response_analyses" ON response_analyses;
CREATE POLICY "Admin full access response_analyses" ON response_analyses FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: execution_queue
CREATE TABLE IF NOT EXISTS execution_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'send_email' | 'launch_sequence' | 'schedule_meeting' | 'executive_escalation'
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'executed' | 'failed' | 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_execution_queue_lead ON execution_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_execution_queue_status ON execution_queue(status);
ALTER TABLE execution_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access execution_queue" ON execution_queue;
CREATE POLICY "Admin full access execution_queue" ON execution_queue FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 6. Table: approval_logs
CREATE TABLE IF NOT EXISTS approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID REFERENCES execution_queue(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    decision TEXT NOT NULL, -- 'approved' | 'rejected' | 'edited'
    actor TEXT DEFAULT 'Founder',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_logs_queue ON approval_logs(queue_id);
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access approval_logs" ON approval_logs;
CREATE POLICY "Admin full access approval_logs" ON approval_logs FOR ALL TO authenticated USING (is_admin(auth.uid()));
