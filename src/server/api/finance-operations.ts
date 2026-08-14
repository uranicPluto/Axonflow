import { db } from "../db";
import { runFinanceAgent } from "../finance-agent";
import { evaluateClientProfitability } from "../client-profitability-engine";
import { evaluateServiceProfitability } from "../service-profitability-engine";
import { generateCashflowForecast } from "../cashflow-forecast-engine";
import { detectFinancialAlerts } from "../financial-alert-engine";

export async function handleGetFinanceAgentRequest(): Promise<Response> {
  try {
    const report = await runFinanceAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[FINANCE-API] Error running finance agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run finance agent" }), { status: 500 });
  }
}

export async function handleGetClientProfitabilityRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const reports = leads.length > 0
      ? leads.slice(0, 5).map((l) => evaluateClientProfitability({ leadId: l.id, clientName: l.company_name || l.name || "Client", revenue: l.value || 15000 }))
      : [evaluateClientProfitability({ clientName: "Acme Corp", revenue: 25000 })];
    return new Response(JSON.stringify({ success: true, reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[FINANCE-API] Error fetching client profitability:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch client profitability" }), { status: 500 });
  }
}

export async function handleGetServiceProfitabilityRequest(): Promise<Response> {
  try {
    const reports = evaluateServiceProfitability();
    return new Response(JSON.stringify({ success: true, reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[FINANCE-API] Error fetching service profitability:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch service profitability" }), { status: 500 });
  }
}

export async function handleGetCashflowForecastRequest(): Promise<Response> {
  try {
    const forecast = generateCashflowForecast();
    return new Response(JSON.stringify({ success: true, forecast }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[FINANCE-API] Error fetching cashflow forecast:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch cashflow forecast" }), { status: 500 });
  }
}

export async function handleGetFinancialAlertsRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const alerts = detectFinancialAlerts(leads);
    return new Response(JSON.stringify({ success: true, alerts }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[FINANCE-API] Error fetching financial alerts:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch financial alerts" }), { status: 500 });
  }
}
