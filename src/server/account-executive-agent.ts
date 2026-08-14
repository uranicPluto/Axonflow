/**
 * Phase 14 — Feature 1: Account Executive Agent
 * Autonomous Senior AE Agent orchestrating end-to-end deal execution,
 * deciding who to contact, what message to send, when to schedule meetings, and how to maximize close probability.
 */

import { logError } from "./error-logger";

export interface AccountExecutiveInput {
  leadId: string;
  leadName: string;
  companyName?: string;
  status: string;
  leadScore?: number;
  closeProbability?: number;
  healthScore?: number;
  intentScore?: number;
  meetingIntelligence?: any;
  proposalEngagement?: any;
  stakeholders?: any[];
}

export interface AccountExecutivePlan {
  priority: number;
  objective: string;
  recommendedAction: string;
  reasoning: string;
  expectedRevenueImpact: number;
  confidence: number;
  executionSteps: string[];
}

export async function runAccountExecutiveAgent(
  input: AccountExecutiveInput
): Promise<AccountExecutivePlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  const company = input.companyName || input.leadName + "'s Team";
  const prob = input.closeProbability || 80;

  if (apiKey) {
    try {
      console.log(`[ACCOUNT-EXECUTIVE-AGENT] Evaluating deal strategy for ${input.leadName} (${company})...`);
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
You are an Autonomous Account Executive for House Of Workflow (AxonFlow).
Analyze the deal parameters and return a JSON object with:
- "priority": Integer 1-100.
- "objective": High-level strategic objective (e.g. "Finalize commercial terms & secure contract signature").
- "recommendedAction": Single primary recommended action (e.g. "Deliver Executive Proposal Briefing to COO & CEO").
- "reasoning": Concise strategic rationale.
- "expectedRevenueImpact": Number (projected dollar impact, e.g. 7500 or 10000).
- "confidence": Integer 1-100.
- "executionSteps": Array of 3 specific execution steps.

Return JSON ONLY.
              `.trim()
            },
            {
              role: "user",
              content: `Lead: ${input.leadName}\nCompany: ${company}\nStage: ${input.status}\nScore: ${input.leadScore || 85}\nClose Prob: ${prob}%\nHealth: ${input.healthScore || 85}`
            }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

        return {
          priority: typeof parsed.priority === "number" ? parsed.priority : 92,
          objective: parsed.objective || `Advance ${company} through ${input.status} stage to contract execution.`,
          recommendedAction: parsed.recommendedAction || "Schedule live proposal review with executive decision maker",
          reasoning: parsed.reasoning || `High close probability (${prob}%) with strong buying intent. Deliver custom proposal blueprint to close.`,
          expectedRevenueImpact: typeof parsed.expectedRevenueImpact === "number" ? parsed.expectedRevenueImpact : 7500,
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 88,
          executionSteps: Array.isArray(parsed.executionSteps) ? parsed.executionSteps : [
            "Queue personalized executive proposal review email",
            "Schedule 20-minute live demonstration",
            "Deliver ROI calculator and contract signature link"
          ]
        };
      }
    } catch (err: any) {
      console.error("[ACCOUNT-EXECUTIVE-AGENT] Error:", err?.message || err);
      await logError({
        service_name: "account_executive_agent",
        operation: "run_ae_plan",
        error_code: "AE_AGENT_ERROR",
        error_message: err?.message || "AE agent error",
        context: { input }
      }).catch(() => {});
    }
  }

  // Analytical Fallback AE Engine
  return {
    priority: Math.min(98, Math.max(60, (input.leadScore || 80) + 10)),
    objective: `Secure final commercial agreement and contract signature with ${company}.`,
    recommendedAction: "Deliver executive proposal presentation and schedule contract review call",
    reasoning: `Prospect exhibits high buying signals and score (${input.leadScore || 80}/100). Next best action is live executive walkthrough.`,
    expectedRevenueImpact: 7500,
    confidence: Math.min(95, Math.max(65, prob)),
    executionSteps: [
      `Prepare tailored proposal package for ${input.leadName}`,
      "Queue executive escalation email for founder approval",
      "Confirm target implementation kickoff date"
    ]
  };
}
