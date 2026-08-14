import { calculateCompanyHealth } from "../company-health-engine";
import { runExecutiveAgent } from "../executive-agent";
import { generateDecisionRecommendations } from "../decision-engine";
import { generateWeeklyCEOBrief } from "../ceo-briefing-engine";
import { getStrategicRoadmap } from "../strategic-priority-engine";

export async function handleGetCompanyHealthRequest(): Promise<Response> {
  try {
    const health = calculateCompanyHealth();
    return new Response(JSON.stringify({ success: true, health }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[COMPANY-OS-API] Error fetching company health:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch company health" }), { status: 500 });
  }
}

export async function handleGetExecutiveReportRequest(): Promise<Response> {
  try {
    const report = await runExecutiveAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[COMPANY-OS-API] Error running executive agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run executive agent" }), { status: 500 });
  }
}

export async function handleGetDecisionQueueRequest(): Promise<Response> {
  try {
    const decisions = generateDecisionRecommendations();
    return new Response(JSON.stringify({ success: true, decisions }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[COMPANY-OS-API] Error fetching decision queue:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch decision queue" }), { status: 500 });
  }
}

export async function handleGetCEOBriefRequest(): Promise<Response> {
  try {
    const brief = generateWeeklyCEOBrief();
    return new Response(JSON.stringify({ success: true, brief }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[COMPANY-OS-API] Error fetching CEO brief:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch CEO brief" }), { status: 500 });
  }
}

export async function handleGetCompanyRoadmapRequest(): Promise<Response> {
  try {
    const roadmap = getStrategicRoadmap();
    return new Response(JSON.stringify({ success: true, roadmap }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[COMPANY-OS-API] Error fetching company roadmap:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch company roadmap" }), { status: 500 });
  }
}
