/**
 * Phase 12 — Feature 4: Next Best Action Engine
 * Evaluates lead signals, intent, and stage to recommend exactly one highest-value sales action.
 */

export interface NextBestActionInput {
  leadId: string;
  status: string;
  leadScore?: number;
  intentScore?: number;
  hasProposal?: boolean;
  meetingCompleted?: boolean;
  daysStale?: number;
}

export interface NextBestAction {
  action: "Schedule Demo" | "Executive Follow-up" | "Technical Workshop" | "Proposal Presentation" | "Budget Validation" | "Contract Review" | "Close Deal";
  priority: number; // 1-100
  reasoning: string;
  expectedLift: number; // percentage revenue lift
}

export function recommendNextBestAction(input: NextBestActionInput): NextBestAction {
  const status = (input.status || "new").toLowerCase();
  const score = input.leadScore || 50;
  const intent = input.intentScore || 50;
  const days = input.daysStale || 0;

  if (status === "negotiation" || (intent >= 85 && input.hasProposal)) {
    return {
      action: "Close Deal",
      priority: 98,
      reasoning: "High buying intent and proposal approved. Execute final contract sign-off.",
      expectedLift: 35
    };
  }

  if (status === "proposal_sent" && input.hasProposal) {
    if (days >= 5) {
      return {
        action: "Executive Follow-up",
        priority: 90,
        reasoning: "Proposal sent over 5 days ago. Require direct founder follow-up to address review concerns.",
        expectedLift: 25
      };
    }
    return {
      action: "Proposal Presentation",
      priority: 88,
      reasoning: "Proposal blueprint delivered. Schedule a 20-minute live walkthrough of deliverables and ROI.",
      expectedLift: 28
    };
  }

  if (status === "discovery_completed" || input.meetingCompleted) {
    if (score < 60) {
      return {
        action: "Budget Validation",
        priority: 75,
        reasoning: "Discovery completed but budget allocation unconfirmed. Clarify commercial alignment.",
        expectedLift: 20
      };
    }
    return {
      action: "Technical Workshop",
      priority: 85,
      reasoning: "Discovery completed with high technical fit. Host technical workshop with engineering lead.",
      expectedLift: 22
    };
  }

  if (status === "meeting_booked") {
    return {
      action: "Schedule Demo",
      priority: 80,
      reasoning: "Meeting booked. Prepare live interactive demo tailored to client firmographics.",
      expectedLift: 18
    };
  }

  return {
    action: "Executive Follow-up",
    priority: 70,
    reasoning: "New inbound lead. Re-engage via automated AI follow-up sequence.",
    expectedLift: 15
  };
}
