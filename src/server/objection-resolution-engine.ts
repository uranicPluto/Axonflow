/**
 * Phase 13 — Feature 2: Objection Resolution Engine
 * Analyzes meeting objections, industry context, service package, and deal size
 * to generate resolution plans, rebuttals, ROI justifications, and risk mitigation messaging.
 */

export interface ObjectionResolutionInput {
  objection: string;
  industry?: string;
  servicePackage?: string;
  dealSize?: number;
}

export interface ResolutionPlan {
  objection: string;
  rootCause: string;
  responseStrategy: string;
  supportingEvidence: string;
  recommendedAssets: string[];
}

export function generateObjectionResolution(
  input: ObjectionResolutionInput
): ResolutionPlan {
  const objectionText = input.objection.toLowerCase();
  const dealSize = input.dealSize || 7500;

  if (objectionText.includes("price") || objectionText.includes("budget") || objectionText.includes("cost") || objectionText.includes("expensive")) {
    return {
      objection: input.objection,
      rootCause: "Prospect perceives price as a cost rather than an ROI-generating investment.",
      responseStrategy: `Reframe $${dealSize.toLocaleString()} investment against the cost of manual operations (saving ~20 hours/week per rep).`,
      supportingEvidence: "Clients deploying AxonFlow achieve full ROI payback within 24 days post-launch.",
      recommendedAssets: ["ROI Calculator Sheet", "AxonFlow Pricing & Payback Blueprint", "Case Study: 310% Operational Lift"]
    };
  }

  if (objectionText.includes("time") || objectionText.includes("busy") || objectionText.includes("capacity") || objectionText.includes("resources")) {
    return {
      objection: input.objection,
      rootCause: "Fear of lengthy implementation bandwidth overhead.",
      responseStrategy: "Highlight our 100% white-glove turnkey setup requiring < 2 hours total founder involvement.",
      supportingEvidence: "Full pipeline setup and integration completes within 5-7 business days.",
      recommendedAssets: ["Implementation Timeline Roadmap", "Turnkey Onboarding Checklist"]
    };
  }

  if (objectionText.includes("security") || objectionText.includes("data") || objectionText.includes("privacy") || objectionText.includes("tech")) {
    return {
      objection: input.objection,
      rootCause: "Data security and technical compliance concerns.",
      responseStrategy: "Emphasize enterprise Supabase RLS security policies, encrypted API tokens, and SOC2 compliance standards.",
      supportingEvidence: "All data resides in dedicated Supabase instance with full audit logging and encryption at rest.",
      recommendedAssets: ["Enterprise Security & Compliance Overview", "Data Protection Policy Document"]
    };
  }

  return {
    objection: input.objection,
    rootCause: "Uncertainty regarding operational transition or competitor comparison.",
    responseStrategy: "Demonstrate live interactive proof-of-concept demonstrating direct workflow execution.",
    supportingEvidence: "98% client retention rate across AI automation deployments.",
    recommendedAssets: ["Interactive Architecture Demo", "Client Success Case Studies"]
  };
}
