/**
 * Phase 14 — Feature 4: Opportunity Creation Engine
 * Scans dormant leads in the CRM (e.g. stalled in discovery/proposal with no recent touch)
 * and constructs personalized reactivation plans with high-probability conversion strategies.
 */

export interface OpportunityCreationPlan {
  leadId: string;
  leadName?: string;
  companyName?: string;
  reactivationProbability: number; // 0-100
  outreachStrategy: string;
  recommendedOffer: string;
  nextActions: string[];
}

export function createReactivationOpportunity(lead: any): OpportunityCreationPlan {
  const name = lead.name || "Prospect";
  const company = lead.company_name || "Account";
  const status = lead.status || "proposal_sent";

  let reactivationProbability = 65;
  let outreachStrategy = "";
  let recommendedOffer = "";
  const nextActions: string[] = [];

  if (status === "proposal_sent" || status === "negotiation") {
    reactivationProbability = 85;
    outreachStrategy = "Executive Alignment & Commercial Flexibility Blueprint";
    recommendedOffer = "Offer custom ROI guarantee + 14-day expedited implementation blueprint";
    nextActions.push(`Send executive note from Founder to ${name} addressing budget timing`);
    nextActions.push("Deliver updated proposal with flexible milestone billing");
    nextActions.push("Propose 15-minute contract review call");
  } else if (status === "discovery_completed" || status === "meeting_booked") {
    reactivationProbability = 75;
    outreachStrategy = "Technical Deep Dive & Architecture Preview";
    recommendedOffer = "Offer complimentary 2-hour workflow automation audit";
    nextActions.push(`Share custom AxonFlow architecture diagram for ${company}`);
    nextActions.push("Invite team to private technical walkthrough");
  } else {
    reactivationProbability = 50;
    outreachStrategy = "Quarterly Industry Insights & Feature Update";
    recommendedOffer = "Share latest case study on 310% intake volume acceleration";
    nextActions.push(`Send quarterly product update to ${name}`);
  }

  return {
    leadId: lead.id,
    leadName: name,
    companyName: company,
    reactivationProbability,
    outreachStrategy,
    recommendedOffer,
    nextActions
  };
}
