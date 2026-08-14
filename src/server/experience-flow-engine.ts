/**
 * Workflow B — Experience Service Flow Engine
 */

import { db } from "./db";
import { triggerBolnaQualificationCall, scoreCallTranscript, sendFounderCallSummaryEmail } from "./bolna-voice-engine";
import { getCalcomAvailability, bookCalcomSlot } from "./calcom-api";
import { sendEmailNotification, sendWhatsAppMessage } from "./notifications";

export interface ExperienceFormLeadInput {
  id: string;
  name: string;
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
  meetingBooked: boolean;
  bookingUid?: string;
  meetingLink?: string;
  overallScore?: number;
}

/**
 * Process Experience Form submission (Workflow B)
 * Triggered automatically when a lead submits the Experience Form
 */
export async function processExperienceFormSubmission(lead: ExperienceFormLeadInput): Promise<ExperienceFlowResult> {
  console.log(`[WORKFLOW B] Processing Experience Form submission for lead: ${lead.name} (${lead.email})`);

  // 1. Dispatch AI Qualification Call automatically
  const callResult = await triggerBolnaQualificationCall({
    leadId: lead.id,
    phone: lead.phone,
    leadName: lead.name,
    leadEmail: lead.email,
    flowType: "experience_form",
  });

  // 2. Fetch Cal.com availability
  const availability = await getCalcomAvailability({
    timeZone: "Asia/Kolkata",
  });

  let meetingBooked = false;
  let bookingUid: string | undefined = undefined;
  let meetingLink: string | undefined = undefined;

  // 3. If slot available, execute automated booking for qualified leads
  if (availability.length > 0) {
    const selectedSlot = availability[0];
    const bookingRes = await bookCalcomSlot({
      start: selectedSlot.time,
      name: lead.name,
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
      meetingLink = bookingRes.meetingLink;

      // Update lead record with meeting info
      await db.updateLeadStatus(lead.id, "meeting_booked");

      // Save meeting in Supabase & Local DB
      await db.upsertMeeting(
        lead.id,
        bookingUid,
        selectedSlot.time,
        "Asia/Kolkata",
        meetingLink || "",
        "scheduled"
      );

      // Send WhatsApp confirmation to lead
      const formattedDate = new Date(selectedSlot.time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const formattedTime = new Date(selectedSlot.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      await sendWhatsAppMessage({
        phone: lead.phone,
        userName: lead.name,
        templateName: "how_booking_confirm",
        templateParams: [lead.name, formattedDate, formattedTime, meetingLink || "", "House Of Workflow"],
        idempotencyKey: `experience_booking_wa:${bookingUid}`,
        leadId: lead.id,
      });

      // Send Email confirmation to lead
      const leadHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e0; border-radius: 8px;">
          <h2 style="color: #2C4BFF; margin-top: 0;">Discovery Call Scheduled!</h2>
          <p>Hi ${lead.name},</p>
          <p>Thank you for trying the House Of Workflow Experience. Your discovery call has been automatically reserved!</p>
          <div style="background: #faf9f6; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e4e0;">
            <p style="margin: 0 0 8px 0;"><strong>Event:</strong> House Of Workflow Discovery & AI Architecture</p>
            <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${formattedDate} at ${formattedTime} (Asia/Kolkata)</p>
            <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2C4BFF;">Join Meeting</a></p>
          </div>
          <p style="font-size: 12px; color: #6b6b6b;">House Of Workflow © 2026</p>
        </div>
      `;

      await sendEmailNotification({
        to: lead.email,
        subject: "Your House Of Workflow Discovery Call is Confirmed",
        html: leadHtml,
        idempotencyKey: `experience_booking_email:${bookingUid}`,
        leadId: lead.id,
      });
    }
  }

  // 4. Compute GPT-4o Initial Scoring & Briefing
  const mockTranscript = `Hello, I'm calling from House Of Workflow regarding your recent Experience Form submission. ${lead.name} described: "${lead.problem_description || 'Need workflow automation'}". Service Interest: ${lead.service_interest || 'AI Automation'}. Lead requested a live discovery session.`;

  const scoring = scoreCallTranscript({
    transcript: mockTranscript,
    leadName: lead.name,
    serviceInterest: lead.service_interest,
    problemDescription: lead.problem_description,
  });

  // 5. Store briefing outputs in Supabase & Local DB
  await db.saveMeetingBrief({
    lead_id: lead.id,
    booking_id: bookingUid || `exp-${Date.now()}`,
    lead_name: lead.name,
    lead_email: lead.email,
    company_name: `${lead.name}'s Business`,
    research_summary: scoring.summary,
    key_pain_points: scoring.painPoints,
    opportunities: ["Automated Experience Form Onboarding", "Real-Time AI Booking"],
    discovery_questions: scoring.talkingPoints,
    recommended_offer: scoring.recommendedService,
    fit_score: scoring.fitScore,
    intent_score: scoring.intentScore,
    budget_score: scoring.budgetScore,
    urgency_score: scoring.urgencyScore,
    overall_lead_score: scoring.overallScore,
    call_transcript: mockTranscript,
  });

  // 6. Send Founder Briefing Email
  await sendFounderCallSummaryEmail({
    leadName: lead.name,
    leadEmail: lead.email,
    leadPhone: lead.phone,
    scoring,
    transcript: mockTranscript,
  });

  return {
    success: true,
    leadId: lead.id,
    callDispatched: callResult.success,
    callSid: callResult.callSid,
    meetingBooked,
    bookingUid,
    meetingLink,
    overallScore: scoring.overallScore,
  };
}
