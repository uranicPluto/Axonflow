/**
 * Phase 18 — Feature 8: Master Customer Success Agent
 * Master Customer Success Orchestrator combining Onboarding, Delivery Health, Customer Health,
 * Renewal Forecasting, Expansion Opportunities, and Sentiment Analysis into CustomerSuccessReport.
 */

import { evaluateClientOnboarding, OnboardingReport } from "./client-onboarding-engine";
import { evaluateDeliveryHealth, DeliveryHealthReport } from "./delivery-health-engine";
import { calculateCustomerHealth, CustomerHealthReport } from "./customer-health-engine";
import { predictRenewalForecast, RenewalForecastReport } from "./renewal-forecast-engine";
import { detectCustomerExpansionOpportunities, ExpansionOpportunityReport } from "./expansion-opportunity-engine";
import { analyzeCustomerSentiment, CustomerSentimentReport } from "./customer-sentiment-engine";

export interface CustomerSuccessReport {
  customerHealthAverage: number;
  customerHealthReports: CustomerHealthReport[];
  topAccountsAtRisk: CustomerHealthReport[];
  onboardingReports: OnboardingReport[];
  deliveryHealthReports: DeliveryHealthReport[];
  renewalForecasts: RenewalForecastReport[];
  expansionOpportunities: ExpansionOpportunityReport[];
  sentimentReports: CustomerSentimentReport[];
  executiveActions: string[];
  totalExpansionImpact: number;
}

export async function runCustomerSuccessAgent(): Promise<CustomerSuccessReport> {
  const { db } = await import("./db");
  const leads = await db.getLeads();

  const accounts = leads.length > 0
    ? leads.slice(0, 4).map((l) => ({ leadId: l.id, clientName: l.company_name || l.name || "Client Account", val: l.value || 36000 }))
    : [
        { clientName: "Acme Corp SaaS", val: 45000 },
        { clientName: "Fintech Dynamics", val: 36000 },
        { clientName: "HealthPulse MedTech", val: 60000 }
      ];

  const onboardingReports = accounts.map((a) => evaluateClientOnboarding({ leadId: a.leadId, clientName: a.clientName }));
  const deliveryHealthReports = accounts.map((a) => evaluateDeliveryHealth({ leadId: a.leadId, clientName: a.clientName }));
  const customerHealthReports = accounts.map((a) => calculateCustomerHealth({ leadId: a.leadId, clientName: a.clientName }));
  const renewalForecasts = accounts.map((a) => predictRenewalForecast({ leadId: a.leadId, clientName: a.clientName, contractValue: a.val }));
  const expansionOpportunities = detectCustomerExpansionOpportunities(leads);
  const sentimentReports = accounts.map((a) => analyzeCustomerSentiment({ leadId: a.leadId, clientName: a.clientName }));

  const topAccountsAtRisk = customerHealthReports.filter((h) => h.healthCategory === "Risk" || h.healthCategory === "Churn Risk");

  // Save outputs in DB
  for (const o of onboardingReports) await db.saveClientOnboardingReport(o);
  for (const d of deliveryHealthReports) await db.saveDeliveryHealthReport(d);
  for (const h of customerHealthReports) await db.saveCustomerHealthScore(h);
  for (const r of renewalForecasts) await db.saveRenewalForecast(r);
  for (const e of expansionOpportunities) await db.saveCustomerExpansionOpportunity(e);
  for (const s of sentimentReports) await db.saveCustomerSentimentReport(s);

  const customerHealthAverage = Math.round(
    customerHealthReports.reduce((sum, h) => sum + h.healthScore, 0) / (customerHealthReports.length || 1)
  );

  const totalExpansionImpact = expansionOpportunities.reduce((sum, e) => sum + e.expectedRevenueImpact, 0);

  const executiveActions = [
    "Schedule Q4 Executive Business Reviews (EBR) for top 3 Champion accounts",
    "Deploy Outbound AI SDR expansion offer to Acme Corp SaaS (+ $24,000 ACV)",
    "Maintain sub-24h technical response SLA on all active onboarding deployments"
  ];

  return {
    customerHealthAverage,
    customerHealthReports,
    topAccountsAtRisk,
    onboardingReports,
    deliveryHealthReports,
    renewalForecasts,
    expansionOpportunities,
    sentimentReports,
    executiveActions,
    totalExpansionImpact
  };
}
