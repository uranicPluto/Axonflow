import { db } from "../db";
import { runCustomerSuccessAgent } from "../customer-success-agent";
import { calculateCustomerHealth } from "../customer-health-engine";
import { predictRenewalForecast } from "../renewal-forecast-engine";
import { detectCustomerExpansionOpportunities } from "../expansion-opportunity-engine";
import { analyzeCustomerSentiment } from "../customer-sentiment-engine";

export async function handleGetCustomerSuccessAgentRequest(): Promise<Response> {
  try {
    const report = await runCustomerSuccessAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CS-API] Error running customer success agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run customer success agent" }), { status: 500 });
  }
}

export async function handleGetCustomerHealthRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const reports = leads.length > 0
      ? leads.slice(0, 5).map((l) => calculateCustomerHealth({ leadId: l.id, clientName: l.company_name || l.name || "Client Account" }))
      : [calculateCustomerHealth({ clientName: "Acme Corp SaaS" })];
    return new Response(JSON.stringify({ success: true, reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CS-API] Error fetching customer health:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch customer health" }), { status: 500 });
  }
}

export async function handleGetRenewalForecastRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const forecasts = leads.length > 0
      ? leads.slice(0, 5).map((l) => predictRenewalForecast({ leadId: l.id, clientName: l.company_name || l.name || "Client Account", contractValue: l.value || 36000 }))
      : [predictRenewalForecast({ clientName: "Acme Corp SaaS" })];
    return new Response(JSON.stringify({ success: true, forecasts }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CS-API] Error fetching renewal forecast:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch renewal forecast" }), { status: 500 });
  }
}

export async function handleGetCustomerExpansionOpportunitiesRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const opportunities = detectCustomerExpansionOpportunities(leads);
    return new Response(JSON.stringify({ success: true, opportunities }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CS-API] Error fetching expansion opportunities:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch expansion opportunities" }), { status: 500 });
  }
}

export async function handleGetCustomerSentimentRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const reports = leads.length > 0
      ? leads.slice(0, 5).map((l) => analyzeCustomerSentiment({ leadId: l.id, clientName: l.company_name || l.name || "Client Account" }))
      : [analyzeCustomerSentiment({ clientName: "Acme Corp SaaS" })];
    return new Response(JSON.stringify({ success: true, reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CS-API] Error fetching customer sentiment:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch customer sentiment" }), { status: 500 });
  }
}
