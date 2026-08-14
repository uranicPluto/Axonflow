/**
 * Feature 7: AI Lead Scoring Engine (0-100)
 * Evaluates 6 core business signals to dynamically calculate lead fit score and category:
 * - Questionnaire quality (0-20 pts)
 * - Company fit / firmographics (0-20 pts)
 * - Urgency signal (0-15 pts)
 * - Budget signal (0-20 pts)
 * - Engagement & activity (0-10 pts)
 * - Discovery call outcomes (0-15 pts)
 */

export interface LeadScoreInput {
  leadId: string;
  hasQuestionnaire?: boolean;
  questionnaireLength?: number;
  companySize?: string;
  employeeCount?: number;
  urgency?: string;
  budgetSignal?: string;
  activityCount?: number;
  meetingCompleted?: boolean;
  meetingOutcomeNotes?: string;
  manualOverrideScore?: number;

  // Phase 11 Meeting Intelligence Boost Signals
  budgetDiscussed?: boolean;
  proposalRequested?: boolean;
  timelineMentioned?: boolean;
  multipleStakeholders?: boolean;
  hasStrongPainPoints?: boolean;
}

export interface LeadScoreResult {
  lead_id: string;
  total_score: number;
  category: "Hot" | "Warm" | "Cold";
  questionnaire_score: number;
  company_fit_score: number;
  urgency_score: number;
  budget_score: number;
  engagement_score: number;
  discovery_outcome_score: number;
  meeting_intelligence_boost: number;
  score_breakdown_json: Record<string, any>;
}

export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  if (input.manualOverrideScore !== undefined && input.manualOverrideScore >= 0) {
    const override = Math.min(100, Math.max(0, input.manualOverrideScore));
    return {
      lead_id: input.leadId,
      total_score: override,
      category: override >= 70 ? "Hot" : override >= 40 ? "Warm" : "Cold",
      questionnaire_score: 20,
      company_fit_score: 20,
      urgency_score: 15,
      budget_score: 20,
      engagement_score: 10,
      discovery_outcome_score: 15,
      meeting_intelligence_boost: 0,
      score_breakdown_json: { manualOverride: true, score: override }
    };
  }

  // 1. Questionnaire Score (0-20)
  let questionnaire_score = 0;
  if (input.hasQuestionnaire) {
    questionnaire_score = 15;
    if ((input.questionnaireLength || 0) > 100) questionnaire_score += 5;
  }

  // 2. Company Fit Score (0-20)
  let company_fit_score = 10;
  const count = input.employeeCount || 0;
  if (count >= 50) company_fit_score = 20;
  else if (count >= 10) company_fit_score = 16;
  else if (count >= 2) company_fit_score = 12;

  // 3. Urgency Score (0-15)
  let urgency_score = 8;
  const urgency = (input.urgency || "").toLowerCase();
  if (urgency.includes("high") || urgency.includes("immediate") || urgency.includes("90")) {
    urgency_score = 15;
  } else if (urgency.includes("medium")) {
    urgency_score = 11;
  }

  // 4. Budget Score (0-20)
  let budget_score = 10;
  const budget = (input.budgetSignal || "").toLowerCase();
  if (budget.includes("high") || budget.includes("enterprise") || budget.includes("5k") || budget.includes("10k")) {
    budget_score = 20;
  } else if (budget.includes("medium") || budget.includes("standard")) {
    budget_score = 15;
  }

  // 5. Engagement Score (0-10)
  const act = input.activityCount || 1;
  const engagement_score = Math.min(10, act * 2.5);

  // 6. Discovery Outcome Score (0-15)
  let discovery_outcome_score = 0;
  if (input.meetingCompleted) {
    discovery_outcome_score = 10;
    if ((input.meetingOutcomeNotes || "").length > 50) discovery_outcome_score += 5;
  }

  // 7. Phase 11 Meeting Intelligence Boost Signals
  let meeting_intelligence_boost = 0;
  if (input.budgetDiscussed) meeting_intelligence_boost += 15;
  if (input.proposalRequested) meeting_intelligence_boost += 20;
  if (input.timelineMentioned) meeting_intelligence_boost += 10;
  if (input.multipleStakeholders) meeting_intelligence_boost += 10;
  if (input.hasStrongPainPoints) meeting_intelligence_boost += 15;

  const rawTotal = Math.round(
    questionnaire_score +
    company_fit_score +
    urgency_score +
    budget_score +
    engagement_score +
    discovery_outcome_score +
    meeting_intelligence_boost
  );

  const total_score = Math.min(100, Math.max(0, rawTotal));

  const category: "Hot" | "Warm" | "Cold" =
    total_score >= 70 ? "Hot" : total_score >= 40 ? "Warm" : "Cold";

  return {
    lead_id: input.leadId,
    total_score,
    category,
    questionnaire_score,
    company_fit_score,
    urgency_score,
    budget_score,
    engagement_score,
    discovery_outcome_score,
    meeting_intelligence_boost,
    score_breakdown_json: {
      questionnaire_score,
      company_fit_score,
      urgency_score,
      budget_score,
      engagement_score,
      discovery_outcome_score,
      meeting_intelligence_boost
    }
  };
}
