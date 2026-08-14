/**
 * Phase 18 E2E Verification Script for Client Delivery Intelligence & Customer Success Operating System
 */

import { evaluateClientOnboarding } from "../src/server/client-onboarding-engine";
import { evaluateDeliveryHealth } from "../src/server/delivery-health-engine";
import { calculateCustomerHealth } from "../src/server/customer-health-engine";
import { predictRenewalForecast } from "../src/server/renewal-forecast-engine";
import { detectCustomerExpansionOpportunities } from "../src/server/expansion-opportunity-engine";
import { analyzeCustomerSentiment } from "../src/server/customer-sentiment-engine";
import { runCustomerSuccessAgent } from "../src/server/customer-success-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 18 CUSTOMER SUCCESS OPERATING SYSTEM TEST ===\n");

  const leads = await db.getLeads();

  // 1. Onboarding Engine
  const onboardingRep = evaluateClientOnboarding({ clientName: "Acme Corp SaaS" });
  if (onboardingRep.readinessScore > 0 && onboardingRep.requiredStakeholders.length > 0) {
    console.log("[1/10] Onboarding Engine ✓ (Readiness: " + onboardingRep.readinessScore + "/100, Timeline: " + onboardingRep.timelineEstimate + ")");
  } else {
    throw new Error("Onboarding engine failed");
  }

  // 2. Delivery Health
  const deliveryRep = evaluateDeliveryHealth({ clientName: "Acme Corp SaaS" });
  if (deliveryRep.healthScore > 0 && deliveryRep.status === "Healthy") {
    console.log("[2/10] Delivery Health ✓ (Health Score: " + deliveryRep.healthScore + "/100, Status: " + deliveryRep.status + ")");
  } else {
    throw new Error("Delivery health engine failed");
  }

  // 3. Customer Health
  const customerHealthRep = calculateCustomerHealth({ clientName: "Acme Corp SaaS" });
  if (customerHealthRep.healthScore > 0 && customerHealthRep.healthCategory === "Champion") {
    console.log("[3/10] Customer Health ✓ (Score: " + customerHealthRep.healthScore + "/100, Category: " + customerHealthRep.healthCategory + ")");
  } else {
    throw new Error("Customer health engine failed");
  }

  // 4. Renewal Forecast
  const renewalRep = predictRenewalForecast({ clientName: "Acme Corp SaaS", contractValue: 36000 });
  if (renewalRep.renewalProbability > 0 && renewalRep.churnProbability < 20) {
    console.log("[4/10] Renewal Forecast ✓ (Renewal Prob: " + renewalRep.renewalProbability + "%, Churn Prob: " + renewalRep.churnProbability + "%)");
  } else {
    throw new Error("Renewal forecast engine failed");
  }

  // 5. Expansion Opportunities
  const expansionOpps = detectCustomerExpansionOpportunities(leads);
  if (expansionOpps.length > 0 && expansionOpps[0].expectedRevenueImpact > 0) {
    console.log("[5/10] Expansion Opportunities ✓ (Expansion Opportunities: " + expansionOpps.length + ")");
  } else {
    throw new Error("Expansion opportunity engine failed");
  }

  // 6. Sentiment Engine
  const sentimentRep = analyzeCustomerSentiment({ clientName: "Acme Corp SaaS" });
  if (sentimentRep.sentimentScore > 0 && sentimentRep.sentimentCategory === "Positive") {
    console.log("[6/10] Sentiment Engine ✓ (Sentiment: " + sentimentRep.sentimentCategory + ", Score: " + sentimentRep.sentimentScore + "/100)");
  } else {
    throw new Error("Customer sentiment engine failed");
  }

  // 7. Customer Success Agent
  const csReport = await runCustomerSuccessAgent();
  if (csReport.customerHealthAverage > 0 && csReport.totalExpansionImpact > 0) {
    console.log("[7/10] Customer Success Agent ✓ (Avg Health: " + csReport.customerHealthAverage + "/100, Expansion: +$" + csReport.totalExpansionImpact.toLocaleString() + ")");
  } else {
    throw new Error("Customer success agent failed");
  }

  // 8. Customer Success War Room Data
  if (csReport.customerHealthReports.length > 0 && csReport.renewalForecasts.length > 0) {
    console.log("[8/10] Customer Success War Room ✓");
  } else {
    throw new Error("Customer success war room verification failed");
  }

  // 9. Founder Brief V8 Data
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData) {
    console.log("[9/10] Founder Brief V8 ✓");
  } else {
    throw new Error("Founder Brief V8 verification failed");
  }

  // 10. APIs
  const { handleGetCustomerSuccessAgentRequest, handleGetCustomerHealthRequest, handleGetRenewalForecastRequest, handleGetCustomerExpansionOpportunitiesRequest, handleGetCustomerSentimentRequest } = await import("../src/server/api/customer-success-api");
  const agentRes = await handleGetCustomerSuccessAgentRequest();
  const healthRes = await handleGetCustomerHealthRequest();
  const renewalRes = await handleGetRenewalForecastRequest();
  const expRes = await handleGetCustomerExpansionOpportunitiesRequest();
  const sentRes = await handleGetCustomerSentimentRequest();

  if (agentRes.status === 200 && healthRes.status === 200 && renewalRes.status === 200 && expRes.status === 200 && sentRes.status === 200) {
    console.log("[10/10] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 18 CUSTOMER SUCCESS OPERATING SYSTEM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
