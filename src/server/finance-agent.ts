/**
 * Phase 17 — Feature 10: Master Finance Agent
 * Master CFO Orchestrator combining Client Profitability, Service Profitability, Unit Economics,
 * Cashflow Forecasting, Financial Health Scoring, Hiring ROI Modeling, and Profit Optimizations into FinanceOperationsReport.
 */

import { evaluateClientProfitability, ClientProfitabilityReport } from "./client-profitability-engine";
import { evaluateServiceProfitability, ServiceProfitabilityReport } from "./service-profitability-engine";
import { calculateUnitEconomics, UnitEconomicsReport } from "./unit-economics-engine";
import { generateCashflowForecast, CashflowForecastReport } from "./cashflow-forecast-engine";
import { evaluateHiringImpact, HiringImpactReport } from "./hiring-impact-engine";
import { calculateFinancialHealth, FinancialHealthReport } from "./financial-health-engine";
import { detectFinancialAlerts, FinancialAlert } from "./financial-alert-engine";
import { generateProfitOptimizations, OptimizationRecommendation } from "./profit-optimization-engine";

export interface FinanceOperationsReport {
  financialHealth: FinancialHealthReport;
  topClients: ClientProfitabilityReport[];
  topServices: ServiceProfitabilityReport[];
  unitEconomics: UnitEconomicsReport;
  cashForecast: CashflowForecastReport;
  hiringRecommendations: HiringImpactReport[];
  optimizationOpportunities: OptimizationRecommendation[];
  financialAlerts: FinancialAlert[];
  projectedProfitImpact: number;
}

export async function runFinanceAgent(): Promise<FinanceOperationsReport> {
  const { db } = await import("./db");
  const leads = await db.getLeads();

  const financialHealth = calculateFinancialHealth(leads);
  
  const topClients = leads.length > 0
    ? leads.slice(0, 3).map((l) => evaluateClientProfitability({ leadId: l.id, clientName: l.company_name || l.name || "Client Account", revenue: l.value || 15000 }))
    : [
        evaluateClientProfitability({ clientName: "Acme Corp SaaS", revenue: 25000, cost: 4500 }),
        evaluateClientProfitability({ clientName: "Fintech Dynamics", revenue: 18000, cost: 3600 }),
        evaluateClientProfitability({ clientName: "HealthPulse MedTech", revenue: 30000, cost: 5000 })
      ];

  const topServices = evaluateServiceProfitability();
  const unitEconomics = calculateUnitEconomics(leads);
  const cashForecast = generateCashflowForecast();
  const hiringRecommendations = evaluateHiringImpact();
  const optimizationOpportunities = generateProfitOptimizations();
  const financialAlerts = detectFinancialAlerts(leads);

  // Save reports in DB
  for (const clientRep of topClients) {
    await db.saveClientProfitabilityReport(clientRep);
  }
  for (const srvRep of topServices) {
    await db.saveServiceProfitabilityReport(srvRep);
  }
  for (const alert of financialAlerts) {
    await db.saveFinancialAlert(alert);
  }

  const projectedProfitImpact = optimizationOpportunities.reduce((sum, o) => sum + o.expectedProfitIncrease, 0);

  return {
    financialHealth,
    topClients,
    topServices,
    unitEconomics,
    cashForecast,
    hiringRecommendations,
    optimizationOpportunities,
    financialAlerts,
    projectedProfitImpact
  };
}
