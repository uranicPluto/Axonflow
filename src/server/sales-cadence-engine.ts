/**
 * Phase 14 — Feature 4: Sales Cadence Engine
 * Manages 7 dynamic sales cadence stages, sequence progress (0-100%), and next touch date scheduling.
 */

export interface SalesCadenceInput {
  leadId: string;
  dealStage: string;
  lastTouchDate?: string;
}

export interface CadencePlan {
  currentStage: string;
  nextTouchDate: string;
  nextAction: string;
  sequenceProgress: number;
}

export const CADENCE_STAGES = [
  { stage: 1, name: "Discovery Follow-Up", progress: 15, defaultAction: "Send discovery recap email & questionnaire" },
  { stage: 2, name: "Proposal Sent", progress: 30, defaultAction: "Deliver proposal blueprint & schedule review call" },
  { stage: 3, name: "Stakeholder Expansion", progress: 50, defaultAction: "Engage COO & CTO decision makers" },
  { stage: 4, name: "Executive Alignment", progress: 65, defaultAction: "Host founder alignment meeting with CEO" },
  { stage: 5, name: "Contract Negotiation", progress: 80, defaultAction: "Resolve pricing/technical terms & deliver contract link" },
  { stage: 6, name: "Closing", progress: 95, defaultAction: "Execute agreement & trigger onboarding sprint" },
  { stage: 7, name: "Re-engagement", progress: 100, defaultAction: "Trigger 5-stage automated win-back sequence" }
];

export function calculateCadencePlan(input: SalesCadenceInput): CadencePlan {
  const dealStageLower = (input.dealStage || "new").toLowerCase();
  let stageObj = CADENCE_STAGES[0];

  if (dealStageLower === "won") {
    stageObj = CADENCE_STAGES[5];
  } else if (dealStageLower === "negotiation") {
    stageObj = CADENCE_STAGES[4];
  } else if (dealStageLower === "proposal_sent") {
    stageObj = CADENCE_STAGES[1];
  } else if (dealStageLower === "discovery_completed") {
    stageObj = CADENCE_STAGES[0];
  } else if (dealStageLower === "lost") {
    stageObj = CADENCE_STAGES[6];
  }

  const lastDate = input.lastTouchDate ? new Date(input.lastTouchDate) : new Date();
  const nextTouch = new Date(lastDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  return {
    currentStage: stageObj.name,
    nextTouchDate: nextTouch,
    nextAction: stageObj.defaultAction,
    sequenceProgress: stageObj.progress
  };
}
