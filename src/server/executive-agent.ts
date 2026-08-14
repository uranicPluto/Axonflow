/**
 * Phase 20 — Feature 4: Master Executive Agent
 * Highest orchestration layer in AxonFlow. Aggregates intelligence across all domain agents
 * (Revenue, Growth, Finance, Customer Success, Delivery) into an ExecutiveOperatingReport.
 */

import { calculateCompanyHealth, CompanyHealthReport } from "./company-health-engine";
import { generateDecisionRecommendations, DecisionRecommendation } from "./decision-engine";
import { generateAgentCollaborations, CollaborationReport } from "./agent-collaboration-engine";
import { generateExecutivePlan, ExecutivePlan } from "./executive-planning-engine";
import { getStrategicRoadmap, StrategicRoadmap } from "./strategic-priority-engine";
import { generateWeeklyCEOBrief, WeeklyCEOBrief } from "./ceo-briefing-engine";

export interface ExecutiveActionItem {
  id: string;
  title: string;
  category: "Revenue" | "Growth" | "Finance" | "Customer Success" | "Delivery";
  reasoning: string;
  impact: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "postponed";
}

export interface ExecutiveOperatingReport {
  companyHealth: CompanyHealthReport;
  decisions: DecisionRecommendation[];
  pendingActions: ExecutiveActionItem[];
  collaborations: CollaborationReport[];
  executivePlan: ExecutivePlan;
  roadmap: StrategicRoadmap;
  ceoBrief: WeeklyCEOBrief;
  topRisks: string[];
  topOpportunities: string[];
  criticalActions: string[];
  resourceConstraints: string[];
  strategicPriorities: string[];
  pendingActionsCount: number;
}

export async function runExecutiveAgent(): Promise<ExecutiveOperatingReport> {
  const { db } = await import("./db");

  const companyHealth = calculateCompanyHealth();
  const decisions = generateDecisionRecommendations();
  const collaborations = generateAgentCollaborations();
  const executivePlan = generateExecutivePlan();
  const roadmap = getStrategicRoadmap();
  const ceoBrief = generateWeeklyCEOBrief();

  const pendingActions: ExecutiveActionItem[] = decisions.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    reasoning: d.reasoning,
    impact: d.impact,
    confidence: d.confidence,
    status: d.status === "recommended" ? "pending" : d.status
  }));

  const topRisks = [
    "Lead AI Engineer capacity is 85% allocated; require AI workload offset to prevent delivery bottleneck.",
    "0 accounts at risk of churn, but Acme Corp SaaS contract renewal requires proactive expansion outreach in Q4."
  ];

  const topOpportunities = [
    "Healthcare & MedTech outbound expansion opportunity (+$45,000 ARR potential).",
    "Acme Corp SaaS account expansion (+$24,000 ARR lift)."
  ];

  const criticalActions = [
    "Approve Autonomous AI SDR Healthcare campaign launch.",
    "Approve Acme Corp Enterprise Automation Module upgrade proposal."
  ];

  const resourceConstraints = [
    "Lead AI Engineer workload allocated at 85%; routine webhook sync task delegated to AI Agent."
  ];

  const strategicPriorities = [
    "Scale Annual Recurring Revenue to $1.2M",
    "Maintain 85%+ Company Gross Margin",
    "Expand Healthcare & MedTech vertical market share"
  ];

  // Save report to DB
  await db.saveCompanyHealthReport(companyHealth);
  await db.saveWeeklyCEOBrief(ceoBrief);
  for (const act of pendingActions) {
    await db.saveExecutiveAction(act);
  }

  return {
    companyHealth,
    decisions,
    pendingActions,
    collaborations,
    executivePlan,
    roadmap,
    ceoBrief,
    topRisks,
    topOpportunities,
    criticalActions,
    resourceConstraints,
    strategicPriorities,
    pendingActionsCount: pendingActions.filter((a) => a.status === "pending").length
  };
}
