/**
 * Feature 6: Proposal Intelligence Engine
 * Generates tailored proposal recommendations, scope outlines, pricing estimates,
 * implementation timelines, and expected ROI for prospects based on discovery call outcomes.
 */

import { logError } from "./error-logger";

export interface ProposalInput {
  leadId: string;
  leadName: string;
  companyName?: string;
  serviceInterest?: string;
  meetingNotes?: string;
  confirmedBudget?: number;
  painPoints?: string;
}

export interface ProposalRecommendationData {
  lead_id: string;
  recommended_package: string;
  estimated_price_range: string;
  implementation_timeline: string;
  project_scope: string;
  expected_roi: string;
  deliverables: string[];
  status: "draft" | "approved" | "sent";
}

export async function generateProposalRecommendation(
  input: ProposalInput
): Promise<ProposalRecommendationData> {
  const apiKey = process.env.OPENAI_API_KEY;
  const company = input.companyName || input.leadName + "'s Business";

  if (apiKey) {
    try {
      console.log(`[PROPOSAL-ENGINE] Generating AI proposal recommendation for ${input.leadName}...`);
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
You are an Enterprise Proposal Strategy Consultant for House Of Workflow (AxonFlow).
Based on the discovery call outcome, generate a tailored proposal recommendation JSON object:
- "recommended_package": One of ("Workflow Audit & Architecture", "AI Agent Sprint", "Internal Knowledge RAG Engine", "Full AI Operational Transformation")
- "estimated_price_range": Estimated investment range (e.g. "$3,500 - $6,000", "$7,500 - $12,500")
- "implementation_timeline": Estimated timeline (e.g. "2 Weeks", "4 Weeks", "6 Weeks")
- "project_scope": Executive breakdown of project objectives and core engineering scope.
- "expected_roi": Quantitative ROI estimate (e.g. "300%+ ROI within 90 days via 80% reduction in manual intake drag").
- "deliverables": Array of 4-6 tangible technical deliverables (e.g. ["Custom n8n Workflow Engine", "Supabase Database Schema", "Slack Webhook Bot"])

Return JSON ONLY.
              `.trim()
            },
            {
              role: "user",
              content: `Lead Name: ${input.leadName}\nCompany: ${company}\nService Interest: ${input.serviceInterest || "AI Automation"}\nMeeting Notes: ${input.meetingNotes || "Wants to automate operations."}\nConfirmed Budget: ${input.confirmedBudget ? "$" + input.confirmedBudget : "Not specified"}`
            }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

        return {
          lead_id: input.leadId,
          recommended_package: parsed.recommended_package || "AI Agent Sprint",
          estimated_price_range: parsed.estimated_price_range || (input.confirmedBudget ? `$${input.confirmedBudget} - $${input.confirmedBudget * 1.5}` : "$5,000 - $8,500"),
          implementation_timeline: parsed.implementation_timeline || "3 Weeks",
          project_scope: parsed.project_scope || `Custom engineering sprint to automate ${company}'s core lead intake, scoring, and CRM notification workflows.`,
          expected_roi: parsed.expected_roi || "Estimated 4x ROI by saving 15+ hours weekly per team member.",
          deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [
            "Production n8n Automated Webhook Workflow",
            "Supabase Unified Data Model & Row Level Security",
            "Real-time Slack Notification Bot & Alerting Engine",
            "Admin Dashboard Intelligence Integration"
          ],
          status: "draft"
        };
      }
    } catch (err: any) {
      console.error("[PROPOSAL-ENGINE] Proposal generation failed:", err?.message || err);
      await logError({
        service_name: "proposal_engine",
        operation: "generate_proposal",
        error_code: "PROPOSAL_ERROR",
        error_message: err?.message || "Proposal generation failed",
        context: { input }
      }).catch(() => {});
    }
  }

  // Fallback proposal recommendation
  return {
    lead_id: input.leadId,
    recommended_package: "AI Agent Sprint & Workflow Optimization",
    estimated_price_range: input.confirmedBudget ? `$${input.confirmedBudget}` : "$5,000 - $7,500",
    implementation_timeline: "2 to 3 Weeks",
    project_scope: `Design, build, and deploy an automated workflow system for ${company} with real-time AI qualification.`,
    expected_roi: "300% ROI in 90 days by reducing manual response latency from hours to seconds.",
    deliverables: [
      "Custom AxonFlow Automated Routing Workflow",
      "Production Supabase Database Schema & RLS Policies",
      "Slack Block Kit Real-Time Alert Engine",
      "Pre-Call Questionnaire Integration"
    ],
    status: "draft"
  };
}
