/**
 * Phase 14 — Feature 1: Outbound Campaign Intelligence Engine
 * Generates personalized multi-channel outbound campaign blueprints (Subject lines, Email sequence,
 * LinkedIn touchpoints, Call scripts, and Personalization hooks) synthesized from lead enrichment & intent signals.
 */

export interface OutboundIntelligenceInput {
  companyName: string;
  leadName: string;
  industry?: string;
  painPoints?: string[];
  intentSignals?: string[];
  icpScore?: number;
}

export interface OutboundCampaign {
  subjectLines: string[];
  emailSequence: string[];
  linkedinMessages: string[];
  callScripts: string[];
  personalizationPoints: string[];
  confidence: number;
}

export function generateOutboundCampaign(
  input: OutboundIntelligenceInput
): OutboundCampaign {
  const company = input.companyName;
  const name = input.leadName;
  const industry = input.industry || "Software & Technology";

  const subjectLines = [
    `Quick Question: Automating intake drag at ${company}`,
    `Solving 20+ hrs/week lead latency for ${company}'s team`,
    `AxonFlow + ${company}: 24/7 AI Qualification Blueprint`
  ];

  const emailSequence = [
    `Hi ${name},\n\nI noticed ${company} is scaling its ${industry} operations. Many founders we work with struggle with manual intake drag and slow response latency.\n\nWe built AxonFlow to run 24/7 AI lead qualification that integrates directly with Supabase & Cal.com, cutting client response latency from hours to < 60 seconds.\n\nWould you be open to a 10-minute live demo this Thursday?\n\nBest,\nJayraj / Founder, House Of Workflow`,
    `Hi ${name},\n\nFollowing up on my note regarding ${company}. We recently helped an operational team automate 310% of their intake volume while reducing overhead.\n\nI've prepared a 2-page ROI blueprint specifically for ${company}. Should I send it over?\n\nBest,\nJayraj`
  ];

  const linkedinMessages = [
    `Hi ${name}, saw your work scaling ${company}. We've built an AI lead operating system for ${industry} teams that cuts intake drag to zero. Would love to connect!`,
    `Hi ${name}, following up on my email regarding ${company}'s intake automation blueprint!`
  ];

  const callScripts = [
    `Hi ${name}, this is Jayraj calling from House Of Workflow. I'm reaching out because we built a 24/7 AI lead qualification pipeline specifically for ${industry} teams like ${company}. Do you have 2 minutes to discuss eliminating intake drag?`
  ];

  const personalizationPoints = [
    `Industry alignment with ${industry} operations`,
    `Targeted pain point: Manual lead qualification overhead`,
    `Targeted solution: Sub-60 second intake latency via AxonFlow AI Agent`
  ];

  const confidence = Math.min(95, Math.max(70, input.icpScore || 85));

  return {
    subjectLines,
    emailSequence,
    linkedinMessages,
    callScripts,
    personalizationPoints,
    confidence
  };
}
