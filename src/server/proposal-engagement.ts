/**
 * Phase 12 — Feature 2: Proposal Engagement Tracking
 * Tracks real-time client engagement on proposals (views, downloads, shares)
 * and calculates engagement score.
 */

export interface ProposalEngagementData {
  id?: string;
  proposal_id: string;
  lead_id: string;
  views: number;
  downloads: number;
  shares: number;
  engagement_score: number;
  first_viewed?: string;
  last_viewed?: string;
  created_at?: string;
  updated_at?: string;
}

export function calculateEngagementScore(
  views: number,
  downloads: number,
  shares: number
): number {
  let score = 0;
  if (views > 0) score += Math.min(15, views * 5);
  if (views >= 3) score += 15;
  if (downloads > 0) score += 20 * downloads;
  if (shares > 0) score += 25 * shares;
  return Math.min(100, score);
}

export async function trackProposalView(
  proposalId: string,
  leadId: string
): Promise<ProposalEngagementData> {
  const { db } = await import("./db");
  const existing = await db.getProposalEngagement(proposalId, leadId);

  const views = (existing?.views || 0) + 1;
  const downloads = existing?.downloads || 0;
  const shares = existing?.shares || 0;
  const engagement_score = calculateEngagementScore(views, downloads, shares);

  const updated: ProposalEngagementData = {
    proposal_id: proposalId,
    lead_id: leadId,
    views,
    downloads,
    shares,
    engagement_score,
    first_viewed: existing?.first_viewed || new Date().toISOString(),
    last_viewed: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return db.saveProposalEngagement(updated);
}

export async function trackProposalDownload(
  proposalId: string,
  leadId: string
): Promise<ProposalEngagementData> {
  const { db } = await import("./db");
  const existing = await db.getProposalEngagement(proposalId, leadId);

  const views = existing?.views || 1;
  const downloads = (existing?.downloads || 0) + 1;
  const shares = existing?.shares || 0;
  const engagement_score = calculateEngagementScore(views, downloads, shares);

  const updated: ProposalEngagementData = {
    proposal_id: proposalId,
    lead_id: leadId,
    views,
    downloads,
    shares,
    engagement_score,
    first_viewed: existing?.first_viewed || new Date().toISOString(),
    last_viewed: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return db.saveProposalEngagement(updated);
}

export async function trackProposalShare(
  proposalId: string,
  leadId: string
): Promise<ProposalEngagementData> {
  const { db } = await import("./db");
  const existing = await db.getProposalEngagement(proposalId, leadId);

  const views = existing?.views || 1;
  const downloads = existing?.downloads || 0;
  const shares = (existing?.shares || 0) + 1;
  const engagement_score = calculateEngagementScore(views, downloads, shares);

  const updated: ProposalEngagementData = {
    proposal_id: proposalId,
    lead_id: leadId,
    views,
    downloads,
    shares,
    engagement_score,
    first_viewed: existing?.first_viewed || new Date().toISOString(),
    last_viewed: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return db.saveProposalEngagement(updated);
}
