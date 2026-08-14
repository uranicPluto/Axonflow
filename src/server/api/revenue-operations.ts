import { db } from "../db";
import { runRevenueOperationsAgent } from "../revenue-operations-agent";
import { generateExecutiveScorecard } from "../executive-scorecard";
import { generateBoardReport } from "../board-report-engine";
import { calculateRevenueTargets } from "../revenue-target-engine";

export async function handleGetRevenueOperationsRequest(): Promise<Response> {
  try {
    const report = await runRevenueOperationsAgent();
    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[REVOPS-API] Error running revenue operations agent:", err);
    return new Response(JSON.stringify({ error: "Failed to run revenue operations agent" }), { status: 500 });
  }
}

export async function handleGetExecutiveScorecardRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const scorecard = generateExecutiveScorecard(leads);
    return new Response(JSON.stringify({ success: true, scorecard }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[REVOPS-API] Error fetching executive scorecard:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch executive scorecard" }), { status: 500 });
  }
}

export async function handleGetBoardReportRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const boardReport = await generateBoardReport(leads);
    return new Response(JSON.stringify({ success: true, boardReport }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[REVOPS-API] Error fetching board report:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch board report" }), { status: 500 });
  }
}

export async function handleGetRevenueTargetsRequest(): Promise<Response> {
  try {
    const leads = await db.getLeads();
    const targets = calculateRevenueTargets(leads);
    return new Response(JSON.stringify({ success: true, targets }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[REVOPS-API] Error fetching revenue targets:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch revenue targets" }), { status: 500 });
  }
}
