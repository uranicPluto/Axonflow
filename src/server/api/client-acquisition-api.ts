import { db } from "../db";
import { runPipelineAgent } from "../pipeline-agent";

export async function handleGetPipelineAgentRequest(): Promise<Response> {
  try {
    const report = await runPipelineAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CLIENT-ACQUISITION-API] Error running pipeline agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run pipeline agent" }), { status: 500 });
  }
}

export async function handleGetAccountPrioritiesRequest(): Promise<Response> {
  try {
    const priorities = await db.getAccountPriorities();
    return new Response(JSON.stringify({ success: true, priorities }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CLIENT-ACQUISITION-API] Error fetching account priorities:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch account priorities" }), { status: 500 });
  }
}

export async function handleGetReactivationOpportunitiesRequest(): Promise<Response> {
  try {
    const opportunities = await db.getReactivationOpportunities();
    return new Response(JSON.stringify({ success: true, opportunities }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[CLIENT-ACQUISITION-API] Error fetching reactivation opportunities:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch reactivation opportunities" }), { status: 500 });
  }
}
