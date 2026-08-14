/**
 * Phase 17 E2E Verification Script for Finance & Profitability Intelligence Platform
 */

import { evaluateClientProfitability } from "../src/server/client-profitability-engine";
import { evaluateServiceProfitability } from "../src/server/service-profitability-engine";
import { calculateUnitEconomics } from "../src/server/unit-economics-engine";
import { generateCashflowForecast } from "../src/server/cashflow-forecast-engine";
import { evaluateHiringImpact } from "../src/server/hiring-impact-engine";
import { calculateFinancialHealth } from "../src/server/financial-health-engine";
import { detectFinancialAlerts } from "../src/server/financial-alert-engine";
import { runFinanceAgent } from "../src/server/finance-agent";
import { db } from "../src/server/db";

async function main() {
  console.log("=== PHASE 17 FINANCE & PROFITABILITY PLATFORM TEST ===\n");

  const leads = await db.getLeads();

  // 1. Client Profitability
  const clientRep = evaluateClientProfitability({ clientName: "Acme SaaS", revenue: 25000 });
  if (clientRep.margin > 0 && clientRep.tier.includes("Tier A")) {
    console.log("[1/10] Client Profitability ✓ (Margin: " + clientRep.margin + "%, Tier: " + clientRep.tier + ")");
  } else {
    throw new Error("Client profitability engine failed");
  }

  // 2. Service Profitability
  const serviceReps = evaluateServiceProfitability();
  if (serviceReps.length > 0 && serviceReps[0].margin > 80) {
    console.log("[2/10] Service Profitability ✓ (Top Service Margin: " + serviceReps[0].margin + "%)");
  } else {
    throw new Error("Service profitability engine failed");
  }

  // 3. Unit Economics
  const unitEcon = calculateUnitEconomics(leads);
  if (unitEcon.ltvCacRatio > 0 && unitEcon.grossMargin > 0) {
    console.log("[3/10] Unit Economics ✓ (LTV:CAC Ratio: " + unitEcon.ltvCacRatio + "x, Payback: " + unitEcon.paybackPeriodMonths + " Mo)");
  } else {
    throw new Error("Unit economics engine failed");
  }

  // 4. Cash Flow Forecast
  const cashForecast = generateCashflowForecast();
  if (cashForecast.forecasts.length === 3 && cashForecast.runwayMonths > 0) {
    console.log("[4/10] Cash Flow Forecast ✓ (Runway: " + cashForecast.runwayMonths + " Months)");
  } else {
    throw new Error("Cash flow forecast engine failed");
  }

  // 5. Hiring Impact
  const hiringReps = evaluateHiringImpact();
  if (hiringReps.length > 0 && hiringReps[0].expectedProfitImpact > 0) {
    console.log("[5/10] Hiring Impact ✓ (Hiring Roles Evaluated: " + hiringReps.length + ")");
  } else {
    throw new Error("Hiring impact engine failed");
  }

  // 6. Financial Health
  const finHealth = calculateFinancialHealth(leads);
  if (finHealth.score > 0 && finHealth.rating) {
    console.log("[6/10] Financial Health ✓ (Score: " + finHealth.score + "/100, Rating: " + finHealth.rating + ")");
  } else {
    throw new Error("Financial health engine failed");
  }

  // 7. Financial Alerts
  const finAlerts = detectFinancialAlerts(leads);
  if (finAlerts.length > 0 && finAlerts[0].severity) {
    console.log("[7/10] Financial Alerts ✓ (Alerts Detected: " + finAlerts.length + ")");
  } else {
    throw new Error("Financial alert engine failed");
  }

  // 8. Finance Agent
  const finReport = await runFinanceAgent();
  if (finReport.financialHealth && finReport.projectedProfitImpact > 0) {
    console.log("[8/10] Finance Agent ✓ (Projected Profit Lift: +$" + finReport.projectedProfitImpact.toLocaleString() + ")");
  } else {
    throw new Error("Finance agent failed");
  }

  // 9. Profitability War Room Data
  if (finReport.topClients.length > 0 && finReport.cashForecast) {
    console.log("[9/10] Profitability War Room ✓");
  } else {
    throw new Error("Profitability war room verification failed");
  }

  // 10. APIs
  const { handleGetFinanceAgentRequest, handleGetClientProfitabilityRequest, handleGetServiceProfitabilityRequest, handleGetCashflowForecastRequest, handleGetFinancialAlertsRequest } = await import("../src/server/api/finance-operations");
  const agentRes = await handleGetFinanceAgentRequest();
  const clientRes = await handleGetClientProfitabilityRequest();
  const serviceRes = await handleGetServiceProfitabilityRequest();
  const cashRes = await handleGetCashflowForecastRequest();
  const alertRes = await handleGetFinancialAlertsRequest();

  if (agentRes.status === 200 && clientRes.status === 200 && serviceRes.status === 200 && cashRes.status === 200 && alertRes.status === 200) {
    console.log("[10/10] APIs ✓");
  } else {
    throw new Error("API verification failed");
  }

  console.log("\nALL TESTS PASSED\n");
  console.log("PHASE 17 FINANCE & PROFITABILITY PLATFORM COMPLETE");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
