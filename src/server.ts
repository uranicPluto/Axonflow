import "./lib/error-capture";
import { assertProductionEnv } from "./server/env-check";

let envChecked = false;
let envError: Error | null = null;

function checkProductionEnvLazy(): Error | null {
  if (!envChecked) {
    envChecked = true;
    try {
      assertProductionEnv();
    } catch (err: any) {
      envError = err;
    }
  }
  return envError;
}

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleApiRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (
    url.pathname !== "/api/health" &&
    url.pathname !== "/api/webhook/calcom" &&
    url.pathname !== "/api/internal/n8n-alert" &&
    url.pathname !== "/api/questionnaire" &&
    url.pathname !== "/api/admin/meeting-outcome" &&
    url.pathname !== "/api/admin/generate-followup" &&
    url.pathname !== "/api/admin/transcripts" &&
    !url.pathname.startsWith("/api/admin/meeting-intelligence") &&
    url.pathname !== "/api/admin/revenue-copilot" &&
    url.pathname !== "/api/admin/revenue-war-room" &&
    !url.pathname.startsWith("/api/admin/buying-intent") &&
    !url.pathname.startsWith("/api/admin/deal-health") &&
    url.pathname !== "/api/admin/proposal-engagement" &&
    url.pathname !== "/api/admin/deal-execution/run" &&
    !url.pathname.startsWith("/api/admin/deal-room") &&
    url.pathname !== "/api/admin/account-executive/run" &&
    !url.pathname.startsWith("/api/admin/account-executive") &&
    !url.pathname.startsWith("/api/admin/approval") &&
    url.pathname !== "/api/admin/pending-actions" &&
    url.pathname !== "/api/admin/pipeline/generate" &&
    url.pathname !== "/api/admin/pipeline/prospects" &&
    url.pathname !== "/api/admin/pipeline/signals" &&
    url.pathname !== "/api/admin/pipeline/opportunities" &&
    url.pathname !== "/api/admin/pipeline-agent" &&
    url.pathname !== "/api/admin/account-priorities" &&
    url.pathname !== "/api/admin/reactivation-opportunities" &&
    url.pathname !== "/api/admin/executive-scorecard" &&
    url.pathname !== "/api/admin/board-report" &&
    url.pathname !== "/api/admin/revenue-operations" &&
    url.pathname !== "/api/admin/revenue-targets" &&
    url.pathname !== "/api/admin/growth-agent" &&
    url.pathname !== "/api/admin/market-intelligence" &&
    url.pathname !== "/api/admin/competitor-intelligence" &&
    url.pathname !== "/api/admin/expansion-opportunities" &&
    url.pathname !== "/api/admin/strategic-alerts" &&
    url.pathname !== "/api/admin/finance-agent" &&
    url.pathname !== "/api/admin/client-profitability" &&
    url.pathname !== "/api/admin/service-profitability" &&
    url.pathname !== "/api/admin/cashflow-forecast" &&
    url.pathname !== "/api/admin/financial-alerts" &&
    url.pathname !== "/api/admin/customer-success-agent" &&
    url.pathname !== "/api/admin/customer-health" &&
    url.pathname !== "/api/admin/renewal-forecast" &&
    url.pathname !== "/api/admin/customer-sentiment" &&
    url.pathname !== "/api/admin/delivery-operations" &&
    url.pathname !== "/api/admin/project-health" &&
    url.pathname !== "/api/admin/team-capacity" &&
    url.pathname !== "/api/admin/resource-allocation" &&
    url.pathname !== "/api/admin/ai-workforce" &&
    url.pathname !== "/api/admin/company-health" &&
    url.pathname !== "/api/admin/executive-report" &&
    url.pathname !== "/api/admin/decision-queue" &&
    url.pathname !== "/api/admin/ceo-brief" &&
    url.pathname !== "/api/admin/company-roadmap"
  ) {
    return null;
  }

  try {
    if (url.pathname === "/api/health") {
      const { handleHealthCheckRequest } = await import("./server/api/health");
      return await handleHealthCheckRequest();
    }

    if (url.pathname === "/api/webhook/calcom") {
      const { handleCalcomWebhookRequest } = await import("./server/api/calcom-webhook");
      return await handleCalcomWebhookRequest(request);
    }

    if (url.pathname === "/api/internal/n8n-alert") {
      const { handleN8nAlertRequest } = await import("./server/api/n8n-alert");
      return await handleN8nAlertRequest(request);
    }

    if (url.pathname === "/api/questionnaire") {
      const { handleQuestionnaireRequest } = await import("./server/api/questionnaire");
      return await handleQuestionnaireRequest(request);
    }

    if (url.pathname === "/api/admin/meeting-outcome") {
      const { handleMeetingOutcomeRequest } = await import("./server/api/meeting-outcome");
      return await handleMeetingOutcomeRequest(request);
    }

    if (url.pathname === "/api/admin/generate-followup") {
      const { handleGenerateFollowUpRequest } = await import("./server/api/generate-followup");
      return await handleGenerateFollowUpRequest(request);
    }

    if (url.pathname === "/api/admin/transcripts") {
      const { handlePostTranscriptRequest } = await import("./server/api/transcripts");
      return await handlePostTranscriptRequest(request);
    }

    if (url.pathname.startsWith("/api/admin/meeting-intelligence/")) {
      const leadId = url.pathname.replace("/api/admin/meeting-intelligence/", "");
      const { handleGetMeetingIntelligenceRequest } = await import("./server/api/transcripts");
      return await handleGetMeetingIntelligenceRequest(leadId);
    }

    if (url.pathname === "/api/admin/revenue-copilot") {
      const { handleGetRevenueCopilotRequest } = await import("./server/api/revenue-copilot-api");
      return await handleGetRevenueCopilotRequest();
    }

    if (url.pathname === "/api/admin/revenue-war-room") {
      const { handleGetRevenueWarRoomRequest } = await import("./server/api/revenue-copilot-api");
      return await handleGetRevenueWarRoomRequest();
    }

    if (url.pathname.startsWith("/api/admin/buying-intent/")) {
      const leadId = url.pathname.replace("/api/admin/buying-intent/", "");
      const { handleGetBuyingIntentRequest } = await import("./server/api/revenue-copilot-api");
      return await handleGetBuyingIntentRequest(leadId);
    }

    if (url.pathname.startsWith("/api/admin/deal-health/")) {
      const leadId = url.pathname.replace("/api/admin/deal-health/", "");
      const { handleGetDealHealthRequest } = await import("./server/api/revenue-copilot-api");
      return await handleGetDealHealthRequest(leadId);
    }

    if (url.pathname === "/api/admin/proposal-engagement") {
      const { handlePostProposalEngagementRequest } = await import("./server/api/revenue-copilot-api");
      return await handlePostProposalEngagementRequest(request);
    }

    if (url.pathname === "/api/admin/deal-execution/run") {
      const { handleRunDealExecutionRequest } = await import("./server/api/deal-execution-api");
      return await handleRunDealExecutionRequest(request);
    }

    if (url.pathname.startsWith("/api/admin/deal-room/")) {
      const leadId = url.pathname.replace("/api/admin/deal-room/", "");
      const { handleGetDealRoomRequest } = await import("./server/api/deal-execution-api");
      return await handleGetDealRoomRequest(leadId);
    }

    if (url.pathname === "/api/admin/account-executive/run") {
      const { handleRunAccountExecutiveRequest } = await import("./server/api/account-executive-api");
      return await handleRunAccountExecutiveRequest(request);
    }

    if (url.pathname.startsWith("/api/admin/account-executive/")) {
      const leadId = url.pathname.replace("/api/admin/account-executive/", "");
      const { handleGetAccountExecutiveRequest } = await import("./server/api/account-executive-api");
      return await handleGetAccountExecutiveRequest(leadId);
    }

    if (url.pathname.startsWith("/api/admin/approval/")) {
      const actionId = url.pathname.replace("/api/admin/approval/", "");
      const { handlePostApprovalRequest } = await import("./server/api/account-executive-api");
      return await handlePostApprovalRequest(actionId, request);
    }

    if (url.pathname === "/api/admin/pending-actions") {
      const { handleGetPendingActionsRequest } = await import("./server/api/account-executive-api");
      return await handleGetPendingActionsRequest();
    }

    if (url.pathname === "/api/admin/pipeline/generate") {
      const { handlePostPipelineGenerateRequest } = await import("./server/api/pipeline-generation-api");
      return await handlePostPipelineGenerateRequest(request);
    }

    if (url.pathname === "/api/admin/pipeline/prospects") {
      const { handleGetPipelineProspectsRequest } = await import("./server/api/pipeline-generation-api");
      return await handleGetPipelineProspectsRequest();
    }

    if (url.pathname === "/api/admin/pipeline/signals") {
      const { handleGetPipelineSignalsRequest } = await import("./server/api/pipeline-generation-api");
      return await handleGetPipelineSignalsRequest();
    }

    if (url.pathname === "/api/admin/pipeline/opportunities") {
      const { handleGetPipelineOpportunitiesRequest } = await import("./server/api/pipeline-generation-api");
      return await handleGetPipelineOpportunitiesRequest();
    }

    if (url.pathname === "/api/admin/pipeline-agent") {
      const { handleGetPipelineAgentRequest } = await import("./server/api/client-acquisition-api");
      return await handleGetPipelineAgentRequest();
    }

    if (url.pathname === "/api/admin/account-priorities") {
      const { handleGetAccountPrioritiesRequest } = await import("./server/api/client-acquisition-api");
      return await handleGetAccountPrioritiesRequest();
    }

    if (url.pathname === "/api/admin/reactivation-opportunities") {
      const { handleGetReactivationOpportunitiesRequest } = await import("./server/api/client-acquisition-api");
      return await handleGetReactivationOpportunitiesRequest();
    }

    if (url.pathname === "/api/admin/executive-scorecard") {
      const { handleGetExecutiveScorecardRequest } = await import("./server/api/revenue-operations");
      return await handleGetExecutiveScorecardRequest();
    }

    if (url.pathname === "/api/admin/board-report") {
      const { handleGetBoardReportRequest } = await import("./server/api/revenue-operations");
      return await handleGetBoardReportRequest();
    }

    if (url.pathname === "/api/admin/revenue-operations") {
      const { handleGetRevenueOperationsRequest } = await import("./server/api/revenue-operations");
      return await handleGetRevenueOperationsRequest();
    }

    if (url.pathname === "/api/admin/revenue-targets") {
      const { handleGetRevenueTargetsRequest } = await import("./server/api/revenue-operations");
      return await handleGetRevenueTargetsRequest();
    }

    if (url.pathname === "/api/admin/growth-agent") {
      const { handleGetGrowthAgentRequest } = await import("./server/api/growth-intelligence");
      return await handleGetGrowthAgentRequest();
    }

    if (url.pathname === "/api/admin/market-intelligence") {
      const { handleGetMarketIntelligenceRequest } = await import("./server/api/growth-intelligence");
      return await handleGetMarketIntelligenceRequest();
    }

    if (url.pathname === "/api/admin/competitor-intelligence") {
      const { handleGetCompetitorIntelligenceRequest } = await import("./server/api/growth-intelligence");
      return await handleGetCompetitorIntelligenceRequest();
    }

    if (url.pathname === "/api/admin/expansion-opportunities") {
      const { handleGetCustomerExpansionOpportunitiesRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerExpansionOpportunitiesRequest();
    }

    if (url.pathname === "/api/admin/strategic-alerts") {
      const { handleGetStrategicAlertsRequest } = await import("./server/api/growth-intelligence");
      return await handleGetStrategicAlertsRequest();
    }

    if (url.pathname === "/api/admin/finance-agent") {
      const { handleGetFinanceAgentRequest } = await import("./server/api/finance-operations");
      return await handleGetFinanceAgentRequest();
    }

    if (url.pathname === "/api/admin/client-profitability") {
      const { handleGetClientProfitabilityRequest } = await import("./server/api/finance-operations");
      return await handleGetClientProfitabilityRequest();
    }

    if (url.pathname === "/api/admin/service-profitability") {
      const { handleGetServiceProfitabilityRequest } = await import("./server/api/finance-operations");
      return await handleGetServiceProfitabilityRequest();
    }

    if (url.pathname === "/api/admin/cashflow-forecast") {
      const { handleGetCashflowForecastRequest } = await import("./server/api/finance-operations");
      return await handleGetCashflowForecastRequest();
    }

    if (url.pathname === "/api/admin/financial-alerts") {
      const { handleGetFinancialAlertsRequest } = await import("./server/api/finance-operations");
      return await handleGetFinancialAlertsRequest();
    }

    if (url.pathname === "/api/admin/customer-success-agent") {
      const { handleGetCustomerSuccessAgentRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerSuccessAgentRequest();
    }

    if (url.pathname === "/api/admin/customer-health") {
      const { handleGetCustomerHealthRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerHealthRequest();
    }

    if (url.pathname === "/api/admin/renewal-forecast") {
      const { handleGetRenewalForecastRequest } = await import("./server/api/customer-success-api");
      return await handleGetRenewalForecastRequest();
    }

    if (url.pathname === "/api/admin/customer-sentiment") {
      const { handleGetCustomerSentimentRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerSentimentRequest();
    }

    if (url.pathname === "/api/admin/delivery-operations") {
      const { handleGetDeliveryOperationsRequest } = await import("./server/api/delivery-operations-api");
      return await handleGetDeliveryOperationsRequest();
    }

    if (url.pathname === "/api/admin/project-health") {
      const { handleGetProjectHealthRequest } = await import("./server/api/delivery-operations-api");
      return await handleGetProjectHealthRequest();
    }

    if (url.pathname === "/api/admin/team-capacity") {
      const { handleGetTeamCapacityRequest } = await import("./server/api/delivery-operations-api");
      return await handleGetTeamCapacityRequest();
    }

    if (url.pathname === "/api/admin/resource-allocation") {
      const { handleGetResourceAllocationRequest } = await import("./server/api/delivery-operations-api");
      return await handleGetResourceAllocationRequest();
    }

    if (url.pathname === "/api/admin/ai-workforce") {
      const { handleGetAIWorkforceRequest } = await import("./server/api/delivery-operations-api");
      return await handleGetAIWorkforceRequest();
    }

    if (url.pathname === "/api/admin/company-health") {
      const { handleGetCompanyHealthRequest } = await import("./server/api/company-os-api");
      return await handleGetCompanyHealthRequest();
    }

    if (url.pathname === "/api/admin/executive-report") {
      const { handleGetExecutiveReportRequest } = await import("./server/api/company-os-api");
      return await handleGetExecutiveReportRequest();
    }

    if (url.pathname === "/api/admin/decision-queue") {
      const { handleGetDecisionQueueRequest } = await import("./server/api/company-os-api");
      return await handleGetDecisionQueueRequest();
    }

    if (url.pathname === "/api/admin/ceo-brief") {
      const { handleGetCEOBriefRequest } = await import("./server/api/company-os-api");
      return await handleGetCEOBriefRequest();
    }

    if (url.pathname === "/api/admin/company-roadmap") {
      const { handleGetCompanyRoadmapRequest } = await import("./server/api/company-os-api");
      return await handleGetCompanyRoadmapRequest();
    }

    if (url.pathname === "/api/admin/strategic-alerts") {
      const { handleGetStrategicAlertsRequest } = await import("./server/api/growth-intelligence");
      return await handleGetStrategicAlertsRequest();
    }

    if (url.pathname === "/api/admin/finance-agent") {
      const { handleGetFinanceAgentRequest } = await import("./server/api/finance-operations");
      return await handleGetFinanceAgentRequest();
    }

    if (url.pathname === "/api/admin/client-profitability") {
      const { handleGetClientProfitabilityRequest } = await import("./server/api/finance-operations");
      return await handleGetClientProfitabilityRequest();
    }

    if (url.pathname === "/api/admin/service-profitability") {
      const { handleGetServiceProfitabilityRequest } = await import("./server/api/finance-operations");
      return await handleGetServiceProfitabilityRequest();
    }

    if (url.pathname === "/api/admin/cashflow-forecast") {
      const { handleGetCashflowForecastRequest } = await import("./server/api/finance-operations");
      return await handleGetCashflowForecastRequest();
    }

    if (url.pathname === "/api/admin/financial-alerts") {
      const { handleGetFinancialAlertsRequest } = await import("./server/api/finance-operations");
      return await handleGetFinancialAlertsRequest();
    }

    if (url.pathname === "/api/admin/customer-success-agent") {
      const { handleGetCustomerSuccessAgentRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerSuccessAgentRequest();
    }

    if (url.pathname === "/api/admin/customer-health") {
      const { handleGetCustomerHealthRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerHealthRequest();
    }

    if (url.pathname === "/api/admin/renewal-forecast") {
      const { handleGetRenewalForecastRequest } = await import("./server/api/customer-success-api");
      return await handleGetRenewalForecastRequest();
    }

    if (url.pathname === "/api/admin/customer-sentiment") {
      const { handleGetCustomerSentimentRequest } = await import("./server/api/customer-success-api");
      return await handleGetCustomerSentimentRequest();
    }
  } catch (err: any) {
    console.error(`[API_ROUTE_ERROR] Uncaught exception in ${url.pathname}:`, err?.stack || err?.message || err);
    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          database: "disconnected",
          environment: process.env.NODE_ENV || "production",
          uptimeSeconds: 0,
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(JSON.stringify({ error: true, message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // 1. Direct API route dispatching (bypasses UI TanStack Router 404)
    const apiResponse = await handleApiRoute(request);
    if (apiResponse) {
      return apiResponse;
    }

    // 2. Lazy production environment verification
    const err = checkProductionEnvLazy();
    if (err) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Configuration Required - House of Workflow</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>` +
        `<body style="font-family:system-ui,-apple-system,sans-serif;background:#090d16;color:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1.5rem;">` +
        `<div style="max-width:540px;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:2rem;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">` +
        `<h2 style="color:#f87171;margin-top:0;">⚡ House of Workflow — Setup Required</h2>` +
        `<p style="color:#d1d5db;line-height:1.6;">The production environment is missing required operational credentials.</p>` +
        `<div style="background:#1e1b4b;border-left:4px solid #6366f1;padding:1rem;margin:1.5rem 0;font-family:monospace;font-size:0.875rem;color:#c7d2fe;word-break:break-word;">` +
        `${err.message}` +
        `</div>` +
        `<p style="color:#9ca3af;font-size:0.875rem;line-height:1.5;"><strong>Next Steps:</strong> Open Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables, set the required variables for Production environment, and trigger a redeploy.</p>` +
        `</div></body></html>`,
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // 3. SSR UI Router handling
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
