import { db } from "../db";
import { runGrowthAgent } from "../growth-agent";
import { generateMarketIntelligenceReport } from "../market-intelligence-engine";
import { generateCompetitorReport } from "../competitor-intelligence-engine";
import { generateExpansionOpportunities } from "../service-expansion-engine";
import { detectStrategicAlerts } from "../strategic-alert-engine";

export async function handleGetGrowthAgentRequest(): Promise<Response> {
  try {
    const report = await runGrowthAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[GROWTH-API] Error running growth agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run growth agent" }), { status: 500 });
  }
}

export async function handleGetMarketIntelligenceRequest(): Promise<Response> {
  try {
    const report = generateMarketIntelligenceReport({ industry: "Software & SaaS" });
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[GROWTH-API] Error fetching market intelligence:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch market intelligence" }), { status: 500 });
  }
}

export async function handleGetCompetitorIntelligenceRequest(): Promise<Response> {
  try {
    const competitors = await db.getCompetitorIntelligence();
    return new Response(JSON.stringify({ success: true, competitors }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[GROWTH-API] Error fetching competitor intelligence:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch competitor intelligence" }), { status: 500 });
  }
}

export async function handleGetExpansionOpportunitiesRequest(): Promise<Response> {
  try {
    const opportunities = generateExpansionOpportunities();
    return new Response(JSON.stringify({ success: true, opportunities }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[GROWTH-API] Error fetching expansion opportunities:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch expansion opportunities" }), { status: 500 });
  }
}

export async function handleGetStrategicAlertsRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const alerts = detectStrategicAlerts(leads);
    return new Response(JSON.stringify({ success: true, alerts }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[GROWTH-API] Error fetching strategic alerts:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch strategic alerts" }), { status: 500 });
  }
}
