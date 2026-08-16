/**
 * Workflow B — GPT Lead Scoring Engine
 * Analyzes service interest, problem description, call summary, and qualification status.
 * Evaluates business potential, urgency, budget likelihood, decision maker access, and fit for House of Workflow.
 */

import { db } from "./db";
import { logActivity } from "./activity-logger";

export interface LeadScoringInput {
  leadId?: string;
  fullName?: string;
  email?: string;
  serviceInterest?: string;
  problemDescription?: string;
  callSummary?: string;
  qualificationStatus?: string;
}

export interface LeadScoringResult {
  score: number; // 0 to 100
  status: "hot" | "warm" | "cold";
  reason: string;
  factors: {
    businessPotential: number; // 0-20
    urgency: number;           // 0-20
    budgetLikelihood: number;  // 0-20
    decisionMakerAccess: number;// 0-20
    fitForHouseOfWorkflow: number; // 0-20
  };
}

/**
 * Score a lead using OpenAI GPT-4o API (or fallback engine)
 */
export async function calculateGptLeadScore(input: LeadScoringInput): Promise<LeadScoringResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const enableMocks = process.env.ENABLE_PROVIDER_MOCKS === "true";

  const promptText = `
You are an expert Lead Scoring AI for House of Workflow (AI Automation, Workflow Systems, AI Voice Agents, Web Dev, CRM Automation).
Analyze the following lead data:

Lead Name: ${input.fullName || "Unknown"}
Service Interest: ${input.serviceInterest || "Not specified"}
Problem Description: ${input.problemDescription || "Not provided"}
Call Summary: ${input.callSummary || "Call completed cleanly"}
Qualification Status: ${input.qualificationStatus || "pending"}

Evaluate across 5 factors (0-20 points each):
1. Business potential (Scope, size, long-term fit)
2. Urgency (Timeline, immediate pain points)
3. Budget likelihood (Enterprise/SaaS/Agency indicators, financial willingness)
4. Decision maker access (Founder, CEO, VP level signals)
5. Fit for House of Workflow (Alignment with core services: AI automation, CRM, voice agents, web dev)

Return strictly valid JSON with this format:
{
  "score": <total_score_0_to_100>,
  "status": "<hot|warm|cold>",
  "reason": "<2-3 sentence explanation summarizing score reasoning>",
  "factors": {
    "businessPotential": <0_to_20>,
    "urgency": <0_to_20>,
    "budgetLikelihood": <0_to_20>,
    "decisionMakerAccess": <0_to_20>,
    "fitForHouseOfWorkflow": <0_to_20>
  }
}
`;

  if (apiKey && !enableMocks) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a precise JSON-only Lead Scoring AI." },
            { role: "user", content: promptText },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content) as LeadScoringResult;
          const score = Math.min(100, Math.max(0, Math.round(parsed.score)));
          let status: "hot" | "warm" | "cold" = "warm";
          if (score >= 80) status = "hot";
          else if (score >= 50) status = "warm";
          else status = "cold";

          return {
            score,
            status,
            reason: parsed.reason || "Score calculated via GPT-4o analysis.",
            factors: parsed.factors || {
              businessPotential: Math.round(score * 0.2),
              urgency: Math.round(score * 0.2),
              budgetLikelihood: Math.round(score * 0.2),
              decisionMakerAccess: Math.round(score * 0.2),
              fitForHouseOfWorkflow: Math.round(score * 0.2),
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("[GPT SCORING] OpenAI call failed, using deterministic fallback:", err?.message);
    }
  }

  // --- Rule-Based Deterministic Scoring Fallback ---
  const text = `${input.serviceInterest || ""} ${input.problemDescription || ""} ${input.callSummary || ""} ${input.qualificationStatus || ""}`.toLowerCase();

  let businessPotential = 14;
  let urgency = 14;
  let budgetLikelihood = 14;
  let decisionMakerAccess = 14;
  let fitForHouseOfWorkflow = 15;

  if (text.includes("saas") || text.includes("agency") || text.includes("enterprise") || text.includes("crm")) {
    businessPotential += 4;
  }
  if (text.includes("asap") || text.includes("immediately") || text.includes("urgent") || text.includes("this month")) {
    urgency += 4;
  }
  if (text.includes("budget") || text.includes("invest") || text.includes("pricing") || text.includes("paid")) {
    budgetLikelihood += 4;
  }
  if (text.includes("founder") || text.includes("ceo") || text.includes("owner") || text.includes("decision maker") || text.includes("yes")) {
    decisionMakerAccess += 4;
  }
  if (text.includes("ai") || text.includes("automation") || text.includes("voice") || text.includes("n8n") || text.includes("web")) {
    fitForHouseOfWorkflow += 4;
  }

  if (input.qualificationStatus === "qualified") {
    urgency = Math.min(20, urgency + 2);
    fitForHouseOfWorkflow = Math.min(20, fitForHouseOfWorkflow + 2);
  } else if (input.qualificationStatus === "not_interested") {
    businessPotential = Math.max(2, businessPotential - 8);
    urgency = Math.max(2, urgency - 8);
    budgetLikelihood = Math.max(2, budgetLikelihood - 8);
  }

  const score = Math.min(100, Math.max(0, businessPotential + urgency + budgetLikelihood + decisionMakerAccess + fitForHouseOfWorkflow));
  let status: "hot" | "warm" | "cold" = "warm";
  if (score >= 80) status = "hot";
  else if (score >= 50) status = "warm";
  else status = "cold";

  const reason = `Evaluated lead for House of Workflow fit. Score ${score}/100 (${status.toUpperCase()}). High potential in service alignment (${input.serviceInterest || "AI Automation"}) and workflow automation requirements.`;

  return {
    score,
    status,
    reason,
    factors: {
      businessPotential,
      urgency,
      budgetLikelihood,
      decisionMakerAccess,
      fitForHouseOfWorkflow,
    },
  };
}

/**
 * Score lead and update Supabase database record
 */
export async function scoreAndUpdateLead(leadId: string): Promise<LeadScoringResult> {
  const lead = await db.getLead(leadId);
  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  const scoring = await calculateGptLeadScore({
    leadId: lead.id,
    fullName: (lead as any).full_name || lead.name,
    email: lead.email,
    serviceInterest: lead.service_interest,
    problemDescription: lead.problem_description,
    callSummary: (lead as any).call_summary || (lead as any).gpt_summary,
    qualificationStatus: (lead as any).qualification_status || "pending",
  });

  await db.updateLeadQualification(leadId, {
    lead_score: scoring.score,
    internal_notes: `[GPT SCORING] Status: ${scoring.status.toUpperCase()} (${scoring.score}/100). Reason: ${scoring.reason}`,
  });

  await logActivity({
    leadId,
    actorType: "system",
    action: "gpt_lead_scoring_completed",
    details: { score: scoring.score, status: scoring.status, reason: scoring.reason },
  });

  return scoring;
}
