/**
 * Feature 9: Automated Follow-Up System
 * Uses OpenAI to generate contextual sales follow-up emails (recap, proposal, reminder, nudge)
 * and logs them in communication_logs for approval/dispatch.
 */

import { logError } from "./error-logger";

export interface FollowUpInput {
  leadId: string;
  leadName: string;
  leadEmail: string;
  type: "recap" | "proposal" | "reminder" | "stalled_nudge";
  meetingNotes?: string;
  proposalPackage?: string;
  proposedPrice?: string;
}

export interface FollowUpResult {
  subject: string;
  html: string;
  text: string;
  type: string;
  leadId: string;
}

export async function generateAIFollowUpEmail(
  input: FollowUpInput
): Promise<FollowUpResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      console.log(`[FOLLOWUP-ENGINE] Generating ${input.type} email for ${input.leadName}...`);
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
You are a top 1% B2B Sales Executive for House Of Workflow (AxonFlow).
Write a high-converting, professional, crisp follow-up email.

Return JSON strictly with:
- "subject": Compelling email subject line.
- "html": HTML formatted email body (clean inline styling).
- "text": Plain text version of email body.
              `.trim()
            },
            {
              role: "user",
              content: `Lead Name: ${input.leadName}\nEmail Type: ${input.type}\nMeeting Notes: ${input.meetingNotes || "Discovery call completed."}\nProposal Package: ${input.proposalPackage || "AI Agent Sprint"}\nPrice Range: ${input.proposedPrice || "$5,000"}`
            }
          ],
          temperature: 0.4
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

        return {
          subject: parsed.subject || `Follow-up: House Of Workflow Discovery Session — ${input.leadName}`,
          html: parsed.html || `<p>Hi ${input.leadName},</p><p>Great speaking with you today regarding your automation goals.</p>`,
          text: parsed.text || `Hi ${input.leadName},\nGreat speaking with you today.`,
          type: input.type,
          leadId: input.leadId
        };
      }
    } catch (err: any) {
      console.error("[FOLLOWUP-ENGINE] Follow-up generation failed:", err?.message || err);
      await logError({
        service_name: "followup_engine",
        operation: "generate_followup",
        error_code: "FOLLOWUP_ERROR",
        error_message: err?.message || "Failed follow-up generation",
        context: { input }
      }).catch(() => {});
    }
  }

  // Fallback email template
  return {
    subject: `Discovery Call Summary & Next Steps — House Of Workflow`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e5e4e0; border-radius: 8px;">
        <h2 style="color: #2C4BFF;">Hi ${input.leadName},</h2>
        <p>Thank you for taking the time to speak with our team today!</p>
        <p>We are excited to help you streamline your operations with custom AI and workflow automation.</p>
        <p><strong>Next Steps:</strong> We have prepared your tailored project proposal blueprint.</p>
        <p style="font-size: 12px; color: #6b6b6b;">House Of Workflow © 2026</p>
      </div>
    `,
    text: `Hi ${input.leadName},\nThank you for speaking with our team today! We look forward to working together.`,
    type: input.type,
    leadId: input.leadId
  };
}
