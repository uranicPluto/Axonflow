import { db } from "../db";
import { runPipelineGenerationAgent } from "../pipeline-generation-agent";

export async function handlePostPipelineGenerateRequest(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    let body: any = {};
    if (rawBody) {
      try { body = JSON.parse(rawBody); } catch {}
    }

    const report = await runPipelineGenerationAgent(body);

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[PIPELINE-API] Error generating outbound pipeline:", err);
    return new Response(JSON.stringify({ error: "Failed to generate pipeline" }), { status: 500 });
  }
}

export async function handleGetPipelineProspectsRequest(): Promise<Response> {
  try {
    const prospects = await db.getProspectAccounts();
    return new Response(JSON.stringify({ success: true, prospects }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[PIPELINE-API] Error fetching prospects:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch prospects" }), { status: 500 });
  }
}

export async function handleGetPipelineSignalsRequest(): Promise<Response> {
  try {
    const signals = await db.getLatestIntentSignals();
    return new Response(JSON.stringify({ success: true, signals }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[PIPELINE-API] Error fetching intent signals:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch intent signals" }), { status: 500 });
  }
}

export async function handleGetPipelineOpportunitiesRequest(): Promise<Response> {
  try {
    const prospects = await db.getProspectAccounts();
    const hotOpportunities = prospects.filter((p) => (p.prospect_score || 50) >= 70);
    return new Response(JSON.stringify({ success: true, opportunities: hotOpportunities }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[PIPELINE-API] Error fetching opportunities:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch opportunities" }), { status: 500 });
  }
}
