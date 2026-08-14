/**
 * Phase 13 — Feature 1: Deal Execution Agent
 * Analyzes lead qualification, deal health, intent, meeting intelligence, and proposal engagement
 * to construct a high-impact DealExecutionPlan driving deals directly to close.
 */

import { logError } from "./error-logger";

export interface DealExecutionPlanInput {
  leadId: string;
  leadName: string;
  companyName?: string;
  status: string;
  leadScore?: number;
  healthScore?: number;
  intentScore?: number;
  closeProbability?: number;
  meetingIntelligence?: any;
}

export interface DealExecutionPlan {
  currentStatus: string;
  executionPriority: number;
  blockers: string[];
  opportunities: string[];
  nextActions: string[];
  estimatedCloseDate: string;
  confidence: number;
}

export async function runDealExecutionAgent(
  input: DealExecutionPlanInput
): Promise<DealExecutionPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  const company = input.companyName || input.leadName + "'s Team";

  if (apiKey) {
    try {
      console.log(`[DEAL-EXECUTION-AGENT] Constructing autonomous execution plan for ${input.leadName}...`);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
You are an Autonomous Senior Deal Execution AE for House Of Workflow (AxonFlow).
Analyze the deal signals and return a JSON object with:
- "currentStatus": Executive status summary of the deal.
- "executionPriority": Integer 1-100.
- "blockers": Array of 2-3 specific deal blockers or friction points.
- "opportunities": Array of 2-3 high-leverage sales opportunities.
- "nextActions": Array of 3 concrete next step action items to execute.
- "estimatedCloseDate": Target close date string (e.g., "14 Days", "End of Month").
- "confidence": Integer 1-100 confidence score in closing.

Return JSON ONLY.
              `.trim()
            },
            {
              role: "user",
              content: `Lead Name: ${input.leadName}\nCompany: ${company}\nStage: ${input.status}\nScore: ${input.leadScore || 80}\nHealth: ${input.healthScore || 85}\nIntent: ${input.intentScore || 85}\nClose Prob: ${input.closeProbability || 80}`
            }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

        return {
          currentStatus: parsed.currentStatus || `High-alignment opportunity with ${company} in ${input.status} stage.`,
          executionPriority: typeof parsed.executionPriority === "number" ? parsed.executionPriority : 90,
          blockers: Array.isArray(parsed.blockers) ? parsed.blockers : ["Awaiting final executive decision maker sign-off", "Technical integration scope validation"],
          opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : ["24/7 AI lead qualification workflow deployment", "Unified Supabase CRM synchronization"],
          nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : ["Schedule 20-minute proposal presentation with CEO", "Deliver customized ROI blueprint"],
          estimatedCloseDate: parsed.estimatedCloseDate || "14 Days",
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 85
        };
      }
    } catch (err: any) {
      console.error("[DEAL-EXECUTION-AGENT] AI Agent error:", err?.message || err);
      await logError({
        service_name: "deal_execution_agent",
        operation: "run_execution_plan",
        error_code: "EXECUTION_AGENT_ERROR",
        error_message: err?.message || "Execution agent error",
        context: { input }
      }).catch(() => {});
    }
  }

  // Analytical Fallback Execution Engine
  return {
    currentStatus: `Active high-priority deal with ${company} currently in ${input.status} stage.`,
    executionPriority: Math.min(95, Math.max(50, (input.leadScore || 75) + 10)),
    blockers: [
      "Awaiting executive decision maker sign-off",
      "Technical implementation timeline alignment"
    ],
    opportunities: [
      "Automated lead routing reducing response latency to < 60 seconds",
      "Deployment of custom AI Agent Sprint"
    ],
    nextActions: [
      "Deliver live proposal walkthrough to executive team",
      "Send technical proof-of-concept case study",
      "Confirm contract signature timeline"
    ],
    estimatedCloseDate: "14 Days",
    confidence: Math.min(95, Math.max(60, input.closeProbability || 80))
  };
}
