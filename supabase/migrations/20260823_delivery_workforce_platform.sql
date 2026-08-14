-- ==============================================================================
-- Migration: 20260823_delivery_workforce_platform.sql
-- Description: Schema for Phase 19 Autonomous Delivery & Workforce Intelligence Platform
-- ==============================================================================

-- 1. Table: projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    client_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    status TEXT DEFAULT 'On Track', -- 'On Track' | 'Watch' | 'Delayed' | 'Critical'
    completion_percent INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access projects" ON projects;
CREATE POLICY "Admin full access projects" ON projects FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 2. Table: project_milestones
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'in_progress', -- 'pending' | 'in_progress' | 'completed' | 'blocked'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access project_milestones" ON project_milestones;
CREATE POLICY "Admin full access project_milestones" ON project_milestones FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Table: resource_allocations
CREATE TABLE IF NOT EXISTS resource_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT,
    resource_name TEXT NOT NULL,
    role TEXT NOT NULL,
    allocated_hours NUMERIC(6,2) DEFAULT 20.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access resource_allocations" ON resource_allocations;
CREATE POLICY "Admin full access resource_allocations" ON resource_allocations FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Table: team_capacity_reports
CREATE TABLE IF NOT EXISTS team_capacity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_capacity_hours NUMERIC(8,2) DEFAULT 160.0,
    allocated_hours NUMERIC(8,2) DEFAULT 128.0,
    availability_percent NUMERIC(5,2) DEFAULT 20.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_capacity_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access team_capacity_reports" ON team_capacity_reports;
CREATE POLICY "Admin full access team_capacity_reports" ON team_capacity_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 5. Table: workforce_utilization_reports
CREATE TABLE IF NOT EXISTS workforce_utilization_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilization_score INTEGER DEFAULT 85,
    billable_utilization NUMERIC(5,2) DEFAULT 80.0,
    delivery_utilization NUMERIC(5,2) DEFAULT 88.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workforce_utilization_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access workforce_utilization_reports" ON workforce_utilization_reports;
CREATE POLICY "Admin full access workforce_utilization_reports" ON workforce_utilization_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 6. Table: delivery_forecasts
CREATE TABLE IF NOT EXISTS delivery_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    on_track_projects INTEGER DEFAULT 3,
    at_risk_projects INTEGER DEFAULT 0,
    forecasted_completion_date TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE delivery_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access delivery_forecasts" ON delivery_forecasts;
CREATE POLICY "Admin full access delivery_forecasts" ON delivery_forecasts FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 7. Table: project_profitability_reports
CREATE TABLE IF NOT EXISTS project_profitability_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT,
    revenue NUMERIC(12,2) DEFAULT 0,
    delivery_costs NUMERIC(12,2) DEFAULT 0,
    gross_margin NUMERIC(5,2) DEFAULT 85.0,
    profitability_score INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_profitability_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access project_profitability_reports" ON project_profitability_reports;
CREATE POLICY "Admin full access project_profitability_reports" ON project_profitability_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 8. Table: delivery_risk_reports
CREATE TABLE IF NOT EXISTS delivery_risk_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT,
    risk_level TEXT DEFAULT 'Low', -- 'Low' | 'Medium' | 'High' | 'Critical'
    delay_probability INTEGER DEFAULT 10,
    budget_overrun_probability INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE delivery_risk_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access delivery_risk_reports" ON delivery_risk_reports;
CREATE POLICY "Admin full access delivery_risk_reports" ON delivery_risk_reports FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 9. Table: ai_agent_workloads
CREATE TABLE IF NOT EXISTS ai_agent_workloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    tasks_completed INTEGER DEFAULT 120,
    hours_saved NUMERIC(8,2) DEFAULT 145.0,
    utilization_rate NUMERIC(5,2) DEFAULT 95.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_agent_workloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access ai_agent_workloads" ON ai_agent_workloads;
CREATE POLICY "Admin full access ai_agent_workloads" ON ai_agent_workloads FOR ALL TO authenticated USING (is_admin(auth.uid()));
