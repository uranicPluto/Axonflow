import { z } from "zod";
import { db } from "../db";
import { logError } from "../error-logger";
import { sanitizeData } from "../sanitize";

const QuestionnaireInputSchema = z.object({
  lead_id: z.string().optional(),
  booking_id: z.string().optional(),
  email: z.string().email("Valid email is required"),
  bottleneck: z.string().min(1, "Bottleneck answer is required"),
  tech_stack: z.string().min(1, "Tech stack answer is required"),
  team_size: z.string().min(1, "Team size is required"),
  goal_90_days: z.string().min(1, "90 day goal is required"),
  booking_reason: z.string().min(1, "Booking reason is required"),
});

export async function handleQuestionnaireRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const rawBody = await request.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const parseResult = QuestionnaireInputSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = parseResult.data;
    console.log(`[QUESTIONNAIRE] Processing submission for ${data.email}...`);

    const result = await db.saveQuestionnaireResponse({
      leadId: data.lead_id,
      bookingId: data.booking_id,
      email: data.email,
      bottleneck: data.bottleneck,
      techStack: data.tech_stack,
      teamSize: data.team_size,
      goal90Days: data.goal_90_days,
      bookingReason: data.booking_reason,
    });

    console.log(`[QUESTIONNAIRE] Saved questionnaire response for ${data.email}`);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[QUESTIONNAIRE] Error processing questionnaire submission:", err);
    await logError({
      service_name: "questionnaire_api",
      operation: "handle_questionnaire",
      error_code: "QUESTIONNAIRE_ERROR",
      error_message: err?.message || "Unknown error",
      context: sanitizeData({ error: err?.stack || err })
    }).catch(() => {});

    return new Response(
      JSON.stringify({ error: "Failed to process questionnaire response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
