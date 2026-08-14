/**
 * AI Research & Brief Generator Engine (Discovery Call Brief 2.0)
 * Generates automated meeting briefs using OpenAI for discovery calls,
 * automation consulting, AI implementation, and workflow optimization projects.
 */

import { logError } from "./error-logger";

export interface AIMeetingBriefInput {
  leadName: string;
  leadEmail: string;
  companyName?: string;
  companyWebsite?: string;
  serviceInterest?: string;
  problemDescription?: string;
  teamSize?: string;
  budgetSignal?: string;
  existingSolutions?: string;
  notes?: string;
}

export interface AIMeetingBriefOutput {
  // Discovery Call Brief 2.0 fields
  executive_summary: string;
  pain_point_analysis: string;
  opportunity_map: string;
  technical_assessment: string;
  budget_probability: "Low" | "Medium" | "High";
  deal_score: number;
  recommended_service_package: string;

  // Backward-compatible fields
  research_summary: string;
  key_pain_points: string;
  opportunities: string;
  discovery_questions: string;
  recommended_offer: string;
}

const SYSTEM_PROMPT = `
You are an expert Senior AI Solutions Architect & Automation Consultant for House Of Workflow (AxonFlow).
Your objective is to generate an actionable, high-impact Discovery Call Brief 2.0 for an upcoming client meeting.

Specialties:
1. Workflow Audit & Blueprint
2. AI Agent Sprint (Autonomous agents, LLM RAG)
3. Internal Knowledge GPT
4. CRM & Database Automation
5. Full AI Transformation

Output JSON ONLY with the following keys:
- "executive_summary": High-level briefing on who they are and their core objective.
- "pain_point_analysis": Detailed analysis of likely broken or manual operational processes.
- "opportunity_map": High-ROI automation opportunities mapped to business outcome.
- "technical_assessment": Analysis of their current tech stack and integration complexity.
- "budget_probability": "Low", "Medium", or "High"
- "deal_score": Integer from 1 to 100 representing initial deal fit score.
- "recommended_service_package": One of ("Workflow Audit & Blueprint", "AI Agent Sprint", "Internal Knowledge GPT", "CRM Automation", "Full AI Transformation").
- "research_summary": Concise 2-3 sentence overview of background.
- "key_pain_points": Bulleted list of 3 specific friction points.
- "opportunities": Bulleted list of 3 automation opportunities.
- "discovery_questions": List of 4-5 strategic questions to ask on the call.
- "recommended_offer": The recommended package with estimated value.

DO NOT output markdown formatting around the JSON.
`.trim();

/**
 * Generate AI Meeting Brief 2.0 via OpenAI Chat Completion API.
 * Falls back gracefully to intelligent default structured insights if OpenAI API is unavailable.
 */
export async function generateAIMeetingBrief(
  input: AIMeetingBriefInput
): Promise<AIMeetingBriefOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  const promptInput = `
LEAD PROFILE:
- Name: ${input.leadName}
- Email: ${input.leadEmail}
- Company Name: ${input.companyName || "Unknown / Stealth"}
- Company Website: ${input.companyWebsite || "N/A"}
- Service Interest: ${input.serviceInterest || "AI Automation & Workflow Consulting"}
- Problem Description: ${input.problemDescription || "Wants to streamline operations and evaluate AI automation."}
- Team Size: ${input.teamSize || "Not specified"}
- Budget Signal: ${input.budgetSignal || "Standard"}
- Existing Solutions: ${input.existingSolutions || "Manual processes & basic tools"}
- Additional Notes: ${input.notes || "Booked via Cal.com discovery schedule"}
  `.trim();

  if (apiKey) {
    try {
      console.log(`[AI-RESEARCH-2.0] Requesting OpenAI Discovery Brief 2.0 for ${input.leadEmail}...`);
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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: promptInput }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;

      if (rawContent) {
        const parsed = JSON.parse(rawContent);

        return {
          executive_summary: parsed.executive_summary || `Prospect ${input.leadName} is seeking to implement automated workflows and AI agents for ${input.companyName || "their team"}.`,
          pain_point_analysis: parsed.pain_point_analysis || `Manual operational bottlenecks causing delayed response times and team friction.`,
          opportunity_map: parsed.opportunity_map || `Deploy AxonFlow lead routing pipelines and 24/7 AI intake assistants.`,
          technical_assessment: parsed.technical_assessment || `Compatible with standard modern cloud API architecture.`,
          budget_probability: (["Low", "Medium", "High"].includes(parsed.budget_probability) ? parsed.budget_probability : "High") as any,
          deal_score: typeof parsed.deal_score === "number" ? parsed.deal_score : 85,
          recommended_service_package: parsed.recommended_service_package || "AI Agent Sprint",

          research_summary: parsed.research_summary || parsed.executive_summary || `Prospect ${input.leadName} booked a discovery call.`,
          key_pain_points: parsed.key_pain_points || parsed.pain_point_analysis || `- Manual follow-up drag\n- Data silos\n- Scalability limits`,
          opportunities: parsed.opportunities || parsed.opportunity_map || `- Automated intake\n- AI RAG search\n- Unified Supabase sync`,
          discovery_questions: parsed.discovery_questions || `1. What is your primary 90-day goal?\n2. What is your team size?\n3. What budget is allocated?`,
          recommended_offer: parsed.recommended_offer || parsed.recommended_service_package || "AI Agent Sprint ($5,000)"
        };
      }
    } catch (err: any) {
      console.error("[AI-RESEARCH-2.0] OpenAI Generation failed:", err?.message || err);
      await logError({
        service_name: "ai_research",
        operation: "generate_meeting_brief_2.0",
        error_code: "OPENAI_BRIEF_2_ERROR",
        error_message: err?.message || "Failed to generate Brief 2.0 via OpenAI",
        context: { email: input.leadEmail, input }
      }).catch(() => {});
    }
  }

  // Fallback brief response generator
  const company = input.companyName || input.leadName + "'s Team";

  return {
    executive_summary: `Prospect ${input.leadName} (${company}) booked a discovery call to evaluate automation consulting and AI deployment to remove operational drag.`,
    pain_point_analysis: `Manual intake processing, disconnected data tools, and lack of real-time lead routing creating operational latency.`,
    opportunity_map: `High ROI opportunities: 1. Instant n8n webhook pipeline, 2. AI Assistant intake agent, 3. Unified Supabase CRM sync.`,
    technical_assessment: `Standard web & REST API infrastructure with low migration effort required.`,
    budget_probability: "High",
    deal_score: 82,
    recommended_service_package: "AI Agent Sprint",

    research_summary: `Prospect ${input.leadName} (${company}) booked a discovery call to explore automation. Initial details indicate strong alignment for process optimization.`,
    key_pain_points: `- High manual effort required for customer intake & lead follow-up.\n- Disconnected internal data systems creating operational silos.\n- Need for automated qualification before team intervention.`,
    opportunities: `- Implement n8n/AxonFlow automated workflow pipelines for instant lead routing.\n- Deploy AI assistant for 24/7 client intake & preliminary diagnostic capture.\n- Integrate unified Supabase storage with Slack/CRM real-time notifications.`,
    discovery_questions: `1. What is the current manual hours spent weekly on this process?\n2. What software platforms currently form your core stack (CRMs, databases)?\n3. What is your timeline for implementing an automated solution?\n4. What budget allocation is targeted for this optimization phase?\n5. Who else on your team will be involved in evaluating this implementation?`,
    recommended_offer: "House Of Workflow AI Agent Sprint ($5,000)"
  };
}
