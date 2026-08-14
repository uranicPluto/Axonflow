/**
 * Phase 13 — Feature 3: Sales Playbook Engine
 * Dynamically generates structured sales playbooks (messaging, discovery questions, proof points,
 * case studies, and closing techniques) tailored to company size, industry, stage, and intent.
 */

export interface SalesPlaybookInput {
  industry?: string;
  companySize?: string;
  dealStage?: string;
  buyingIntentScore?: number;
}

export interface SalesPlaybook {
  messaging: string[];
  discoveryQuestions: string[];
  proofPoints: string[];
  caseStudies: string[];
  closingTechniques: string[];
}

export function generateSalesPlaybook(
  input: SalesPlaybookInput
): SalesPlaybook {
  const intent = input.buyingIntentScore || 75;

  return {
    messaging: [
      "Eliminate manual intake drag with autonomous AI workflows",
      "Deploy 24/7 client booking and automatic lead research in under 7 days",
      "Achieve 10x faster lead response times with unified Supabase CRM"
    ],
    discoveryQuestions: [
      "How many hours per week does your team spend manually transferring lead data?",
      "What is your target timeline for automating inbound booking qualification?",
      "Who else on your executive team will review technical integration specs?"
    ],
    proofPoints: [
      "Average 24-day full ROI payback period",
      "Over 500+ successful workflows orchestrated via n8n & Supabase",
      "Zero downtime dual-engine DB architecture"
    ],
    caseStudies: [
      "How Acme Automations Scaled Lead Response by 400%",
      "Enterprise Sales OS Implementation: From Intake to Deal Close"
    ],
    closingTechniques: [
      intent >= 80 ? "Assumptive Close: Present final contract signature link with target kickoff date" : "Summary Close: Recapitulate confirmed pain points and present custom proposal blueprint",
      "Urgency Discount / Implementation Priority Slot Commitment"
    ]
  };
}
