import { db } from "../db";
import { runDeliveryOperationsAgent } from "../delivery-operations-agent";
import { evaluateProjectExecution } from "../project-execution-engine";
import { calculateTeamCapacity } from "../team-capacity-engine";
import { generateResourceAllocationPlan } from "../resource-allocation-engine";
import { calculateAIWorkforceMetrics } from "../ai-workforce-engine";

export async function handleGetDeliveryOperationsRequest(): Promise<Response> {
  try {
    const report = await runDeliveryOperationsAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DELIVERY-API] Error running delivery operations agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run delivery operations agent" }), { status: 500 });
  }
}

export async function handleGetProjectHealthRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const reports = leads.length > 0
      ? leads.slice(0, 5).map((l) => evaluateProjectExecution({ projectId: l.id, projectName: `${l.company_name || l.name || "Client"} Deployment`, clientName: l.company_name || l.name || "Client Account" }))
      : [evaluateProjectExecution({ projectName: "Acme SaaS Deployment", clientName: "Acme Corp" })];
    return new Response(JSON.stringify({ success: true, reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DELIVERY-API] Error fetching project health:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch project health" }), { status: 500 });
  }
}

export async function handleGetTeamCapacityRequest(): Promise<Response> {
  try {
    const capacity = calculateTeamCapacity();
    return new Response(JSON.stringify({ success: true, capacity }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DELIVERY-API] Error fetching team capacity:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch team capacity" }), { status: 500 });
  }
}

export async function handleGetResourceAllocationRequest(): Promise<Response> {
  try {
    const allocation = generateResourceAllocationPlan();
    return new Response(JSON.stringify({ success: true, allocation }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DELIVERY-API] Error fetching resource allocation:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch resource allocation" }), { status: 500 });
  }
}

export async function handleGetAIWorkforceRequest(): Promise<Response> {
  try {
    const aiWorkforce = calculateAIWorkforceMetrics();
    return new Response(JSON.stringify({ success: true, aiWorkforce }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[DELIVERY-API] Error fetching AI workforce metrics:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch AI workforce metrics" }), { status: 500 });
  }
}
