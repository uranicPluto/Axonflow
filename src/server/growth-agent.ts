/**
 * Phase 16 — Feature 9: Autonomous Growth Agent
 * Master CEO AI Strategy Orchestrator combining Market Intelligence, Competitor Intelligence,
 * Industry Attractiveness, Service Expansion Opportunities, Strategic Alerts, and Roadmap Planning into GrowthStrategyReport.
 */

import { generateMarketIntelligenceReport, MarketIntelligenceReport } from "./market-intelligence-engine";
import { generateCompetitorReport, CompetitorReport } from "./competitor-intelligence-engine";
import { scoreIndustryAttractiveness, IndustryScore } from "./industry-attractiveness";
import { generateExpansionOpportunities, ExpansionOpportunity } from "./service-expansion-engine";
import { generateStrategicOpportunities, StrategicOpportunity } from "./strategic-opportunity-engine";
import { generateGrowthPlan, GrowthPlan } from "./growth-planning-engine";
import { detectStrategicAlerts, StrategicAlert } from "./strategic-alert-engine";

export interface GrowthStrategyReport {
  topIndustries: IndustryScore[];
  marketReport: MarketIntelligenceReport;
  topCompetitorThreats: CompetitorReport[];
  topExpansionOpportunities: ExpansionOpportunity[];
  strategicOpportunities: StrategicOpportunity[];
  growthPlan: GrowthPlan;
  strategicAlerts: StrategicAlert[];
  recommendedActions: string[];
  estimatedRevenueImpact: number;
}

export async function runGrowthAgent(): Promise<GrowthStrategyReport> {
  const { db } = await import("./db");
  const leads = await db.getLeads();

  const topIndustries = [
    scoreIndustryAttractiveness({ industry: "Software & SaaS" }),
    scoreIndustryAttractiveness({ industry: "Healthcare & MedTech" }),
    scoreIndustryAttractiveness({ industry: "Financial Services" })
  ];

  const marketReport = generateMarketIntelligenceReport({ industry: "Software & SaaS" });
  const topCompetitorThreats = [
    generateCompetitorReport({ competitorName: "Legacy SDR Agency" })
  ];
  const topExpansionOpportunities = generateExpansionOpportunities();
  const strategicOpportunities = generateStrategicOpportunities();
  const growthPlan = generateGrowthPlan();
  const strategicAlerts = detectStrategicAlerts(leads);

  // Save outputs in DB
  await db.saveMarketIntelligenceReport(marketReport);
  for (const comp of topCompetitorThreats) {
    await db.saveCompetitorIntelligence(comp);
  }
  for (const opp of topExpansionOpportunities) {
    await db.saveExpansionOpportunity(opp);
  }
  for (const alert of strategicAlerts) {
    await db.saveStrategicAlert(alert);
  }

  const recommendedActions = [
    "Launch Autonomous Outbound AI SDR service for Software & SaaS accounts",
    "Initiate healthcare vertical expansion blueprint targeting medical clinics",
    "Deploy 1-click Approval Center integration for agency channel partners"
  ];

  const estimatedRevenueImpact = topExpansionOpportunities.reduce((sum, o) => sum + o.estimatedRevenue, 0);

  return {
    topIndustries,
    marketReport,
    topCompetitorThreats,
    topExpansionOpportunities,
    strategicOpportunities,
    growthPlan,
    strategicAlerts,
    recommendedActions,
    estimatedRevenueImpact
  };
}
