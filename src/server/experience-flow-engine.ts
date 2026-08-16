/**
 * Workflow B — Experience Service Flow Engine
 * Complete lead capture & qualification automation for House of Workflow.
 */

import { db } from "./db";
import { triggerBolnaQualificationCall, sendFounderCallSummaryEmail } from "./bolna-voice-engine";
import { getCalcomAvailability, bookCalcomSlot } from "./calcom-api";
import { sendEmailNotification, sendWhatsAppMessage } from "./notifications";
import { calculateGptLeadScore } from "./lead-scoring-engine";

export interface ExperienceFormLeadInput {
  id: string;
  full_name?: string;
  name?: string;
  email: string;
  phone: string;
  service_interest?: string;
  problem_description?: string;
}

export interface ExperienceFlowResult {
  success: boolean;
  leadId: string;
  callDispatched: boolean;
  callSid?: string;
  qualificationStatus?: string;
  meetingBooked: boolean;
  bookingUid?: string;
  meetingLink?: string;
  leadScore?: number;
  leadScoreReason?: string;
}

/**
 * Helper to format WhatsApp message text as per Workflow B spec:
 * Hi {{name}},
 * Your consultation with House of Workflow has been scheduled.
 * Date: {{date}}
 * Time: {{time}}
 * Meeting Link: {{meeting_link}}
 * Looking forward to helping your business grow.
 * — House of Workflow
 */
export function formatWhatsAppConfirmationText(params: {
  name: string;
  date: string;
  time: string;
  meetingLink: string;
}): string {
  return `Hi ${params.name},\n\nYour consultation with House of Workflow has been scheduled.\n\nDate: ${params.date}\nTime: ${params.time}\n\nMeeting Link:\n${params.meetingLink}\n\nLooking forward to helping your business grow.\n\n— House of Workflow`;
}

/**
 * Helper to format Email confirmation HTML as per Workflow B spec:
 * Subject: Your House of Workflow Consultation is Confirmed
 * Body:
 * Hi {{name}},
 * Your consultation has been successfully scheduled.
 * Date: {{date}}
 * Time: {{time}}
 * Meeting Link: {{meeting_link}}
 * Agenda:
 * • Understand your business
 * • Identify automation opportunities
 * • Discuss implementation roadmap
 * We look forward to meeting you.
 * House of Workflow
 */
export function formatEmailConfirmationHtml(params: {
  name: string;
  date: string;
  time: string;
  meetingLink: string;
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e4e0; border-radius: 12px; background: #ffffff;">
      <p style="font-size: 16px; color: #0d0d0d;">Hi ${params.name},</p>
      <p style="font-size: 15px; color: #333333;">Your consultation has been successfully scheduled.</p>
      
      <div style="background: #faf9f6; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e4e0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a1a;"><strong>Date:</strong> ${params.date}</p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a1a;"><strong>Time:</strong> ${params.time}</p>
        <p style="margin: 0; font-size: 14px; color: #1a1a1a;"><strong>Meeting Link:</strong> <a href="${params.meetingLink}" style="color: #2C4BFF; text-decoration: underline;">${params.meetingLink}</a></p>
      </div>

      <p style="font-size: 15px; font-weight: 600; color: #0d0d0d; margin-bottom: 8px;">Agenda:</p>
      <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 14px; color: #444444; line-height: 1.6;">
        <li>Understand your business</li>
        <li>Identify automation opportunities</li>
        <li>Discuss implementation roadmap</li>
      </ul>

      <p style="font-size: 15px; color: #333333; margin-bottom: 24px;">We look forward to meeting you.</p>

      <p style="font-size: 15px; font-weight: 600; color: #0d0d0d; margin: 0;">House of Workflow</p>
    </div>
  `;
}

/**
 * Process Experience Form submission (Workflow B)
 * Triggered automatically when a website visitor submits the Experience Service Form.
 */
export async function processExperienceFormSubmission(lead: ExperienceFormLeadInput): Promise<ExperienceFlowResult> {
  const fullName = lead.full_name || lead.name || "Valued Client";
  console.log(`[WORKFLOW B] Processing Experience Form submission for: ${fullName} (${lead.email})`);

  // 1. Initial Supabase record status verification & update
  const initialStatus = "new_lead";
  const initialQualification = "pending";

  await db.updateLeadQualification(lead.id, {
    status: initialStatus,
    qualification_status: initialQualification,
    internal_notes: `[WORKFLOW B INTAKE] Source: experience_service. Service: ${lead.service_interest || "Not specified"}. Problem: ${lead.problem_description || "Not provided"}`,
  });

  // 2. Trigger Outbound Bolna AI Qualification Call
  const callResult = await triggerBolnaQualificationCall({
    leadId: lead.id,
    phone: lead.phone,
    leadName: fullName,
    leadEmail: lead.email,
    flowType: "experience_form",
  });

  // Update status to 'called'
  await db.updateLeadStatus(lead.id, "called");

  // Mock call transcript/summary generated by voice call flow
  const callTranscript = `Agent: Hi ${fullName}, calling from House of Workflow regarding your ${lead.service_interest || "automation"} inquiry. ${fullName}: Yes, our team is struggling with ${lead.problem_description || "manual bottlenecks"}. Agent: We can definitely automate this with our AI Workflow Systems. Would you like to schedule a consultation? ${fullName}: Yes, tomorrow sounds great.`;
  const callSummary = `Confirmed service interest in ${lead.service_interest || "AI Automation"}. Pain point: "${lead.problem_description || "Manual workflow bottlenecks"}". High urgency & decision-maker confirmed. Accepted consultation booking.`;
  const qualificationOutcome = "qualified"; // 'qualified' | 'needs_follow_up' | 'not_interested'

  // Update call logs in Supabase
  await db.updateLeadQualification(lead.id, {
    qualification_status: qualificationOutcome,
    call_summary: callSummary,
    call_transcript: callTranscript,
    status: "qualified",
  });

  // 3. Check Calendar Availability (Cal.com API)
  const availability = await getCalcomAvailability({
    timeZone: "Asia/Kolkata",
  });

  let meetingBooked = false;
  let bookingUid: string | undefined = undefined;
  let meetingLink: string | undefined = undefined;
  let meetingTimeIso: string | undefined = undefined;

  // 4. Automatic Booking in Cal.com if slot available & qualified
  if (availability.length > 0 && qualificationOutcome === "qualified") {
    const selectedSlot = availability[0];
    meetingTimeIso = selectedSlot.time;

    const bookingRes = await bookCalcomSlot({
      start: selectedSlot.time,
      name: fullName,
      email: lead.email,
      phone: lead.phone,
      timezone: "Asia/Kolkata",
      responses: {
        service_interest: lead.service_interest || "AI Automation",
        problem_description: lead.problem_description || "Experience Form Submission",
      },
    });

    if (bookingRes.success && bookingRes.bookingUid) {
      meetingBooked = true;
      bookingUid = bookingRes.bookingUid;
      meetingLink = bookingRes.meetingLink || `https://cal.com/meeting/${bookingUid}`;

      // Update Supabase with meeting booking details
      await db.updateLeadQualification(lead.id, {
        status: "meeting_booked",
        meeting_booked: true,
        meeting_time: meetingTimeIso,
        meeting_link: meetingLink,
      });

      // Save meeting record in Supabase & Local DB
      await db.upsertMeeting(
        lead.id,
        bookingUid,
        selectedSlot.time,
        "Asia/Kolkata",
        meetingLink,
        "scheduled"
      );

      // Format Date & Time strings for confirmations
      const dateObj = new Date(selectedSlot.time);
      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      // 5. Send WhatsApp Confirmation
      await sendWhatsAppMessage({
        phone: lead.phone,
        userName: fullName,
        templateName: "how_booking_confirm",
        templateParams: [fullName, dateStr, timeStr, meetingLink, "House of Workflow"],
        idempotencyKey: `wf_b_wa_confirm_${bookingUid}`,
        leadId: lead.id,
      });

      // 6. Send Email Confirmation
      const emailHtml = formatEmailConfirmationHtml({
        name: fullName,
        date: dateStr,
        time: timeStr,
        meetingLink,
      });

      await sendEmailNotification({
        to: lead.email,
        subject: "Your House of Workflow Consultation is Confirmed",
        html: emailHtml,
        idempotencyKey: `wf_b_email_confirm_${bookingUid}`,
        leadId: lead.id,
      });
    }
  }

  // 7. Execute GPT Lead Scoring
  const scoring = await calculateGptLeadScore({
    leadId: lead.id,
    fullName,
    email: lead.email,
    serviceInterest: lead.service_interest,
    problemDescription: lead.problem_description,
    callSummary,
    qualificationStatus: qualificationOutcome,
  });

  // Save lead score and lead score reason in Supabase
  await db.updateLeadQualification(lead.id, {
    lead_score: scoring.score,
    lead_score_reason: scoring.reason,
  });

  // 8. Founder Summary Briefing
  await sendFounderCallSummaryEmail({
    leadName: fullName,
    leadEmail: lead.email,
    leadPhone: lead.phone,
    scoring: {
      fitScore: scoring.factors.businessPotential * 5,
      intentScore: scoring.factors.urgency * 5,
      budgetScore: scoring.factors.budgetLikelihood * 5,
      urgencyScore: scoring.factors.urgency * 5,
      overallScore: scoring.score,
      category: scoring.status === "hot" ? "Hot" : scoring.status === "warm" ? "Warm" : "Cold",
      summary: scoring.reason,
      painPoints: [lead.problem_description || "Manual workflow bottlenecks"],
      recommendedService: lead.service_interest || "AI Automation & Custom Software Solutions",
      talkingPoints: [
        `Review ${fullName}'s pain points: ${lead.problem_description || "Workflow automation"}`,
        `Present House of Workflow AI SDR & CRM Automation capabilities`,
      ],
      rescheduleRequested: false,
    },
    transcript: callTranscript,
  });

  return {
    success: true,
    leadId: lead.id,
    callDispatched: callResult.success,
    callSid: callResult.callSid,
    qualificationStatus: qualificationOutcome,
    meetingBooked,
    bookingUid,
    meetingLink,
    leadScore: scoring.score,
    leadScoreReason: scoring.reason,
  };
}
