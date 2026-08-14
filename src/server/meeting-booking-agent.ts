/**
 * Phase 14 — Feature 3: Meeting Booking Agent
 * Evaluates deal stage, intent, and buying signals to recommend structured meeting types,
 * agenda items, required attendees, and expected outcomes.
 */

export interface MeetingBookingInput {
  leadName: string;
  companyName?: string;
  dealStage: string;
  intentScore?: number;
  hasProposal?: boolean;
}

export interface MeetingRecommendation {
  meetingType: "Discovery Follow-Up" | "Proposal Review" | "Technical Workshop" | "Executive Alignment" | "Contract Review";
  objective: string;
  attendees: string[];
  agenda: string[];
  expectedOutcome: string;
}

export function generateMeetingRecommendation(
  input: MeetingBookingInput
): MeetingRecommendation {
  const stage = (input.dealStage || "new").toLowerCase();
  const company = input.companyName || input.leadName + "'s Team";

  if (stage === "negotiation" || (input.intentScore || 0) >= 85) {
    return {
      meetingType: "Contract Review",
      objective: `Finalize commercial terms and secure contract execution for ${company}`,
      attendees: [input.leadName, "CEO / Founder", "Jayraj (Founder, House Of Workflow)"],
      agenda: [
        "Review final scope & deliverables",
        "Confirm payment schedule & SLA guarantees",
        "Execute agreement & set kickoff date"
      ],
      expectedOutcome: "Signed agreement and target kickoff schedule"
    };
  }

  if (stage === "proposal_sent" || input.hasProposal) {
    return {
      meetingType: "Proposal Review",
      objective: `Present custom AxonFlow proposal blueprint and address feedback with ${company}`,
      attendees: [input.leadName, "COO / Tech Lead", "Jayraj (Founder)"],
      agenda: [
        "Walkthrough custom architecture & ROI breakdown",
        "Review turn-key implementation timeline",
        "Address technical or budget questions"
      ],
      expectedOutcome: "Verbal agreement on scope & progress to contract"
    };
  }

  if (stage === "discovery_completed") {
    return {
      meetingType: "Technical Workshop",
      objective: `Validate integration architecture and Supabase CRM workflow specs for ${company}`,
      attendees: [input.leadName, "Technical Lead", "Solutions Architect"],
      agenda: [
        "Inspect current intake workflow drag",
        "Map Supabase RLS schema & n8n webhook triggers",
        "Confirm security & compliance criteria"
      ],
      expectedOutcome: "Technical sign-off and proposal approval"
    };
  }

  return {
    meetingType: "Discovery Follow-Up",
    objective: `Uncover core intake bottlenecks and establish automation objectives for ${company}`,
    attendees: [input.leadName, "Jayraj (Founder)"],
    agenda: [
      "Review current lead process drag",
      "Demonstrate live AI qualification demo",
      "Establish target 90-day ROI goals"
    ],
    expectedOutcome: "Confirmed pain points & proposal request"
  };
}
