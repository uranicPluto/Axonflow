/**
 * Phase 13 — Feature 6: Deal Timeline Tracker Engine
 * Constructs a chronological execution timeline, calculates deal momentum score (0-100),
 * tracks days in current stage, and evaluates velocity rating.
 */

export interface DealTimelineInput {
  leadCreatedAt: string;
  status: string;
  updatedAt?: string;
  hasMeeting?: boolean;
  hasProposal?: boolean;
  engagementCount?: number;
}

export interface DealTimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DealTimeline {
  events: DealTimelineEvent[];
  momentumScore: number;
  daysInStage: number;
  velocity: "High" | "Normal" | "Stalled";
}

export function buildDealTimeline(input: DealTimelineInput): DealTimeline {
  const createdDate = new Date(input.leadCreatedAt);
  const events: DealTimelineEvent[] = [
    {
      id: "evt-1",
      type: "lead_created",
      title: "Inbound Lead Captured",
      description: "Lead submitted qualification form & booked call",
      timestamp: createdDate.toISOString()
    }
  ];

  if (input.hasMeeting || input.status !== "new") {
    events.push({
      id: "evt-2",
      type: "discovery_completed",
      title: "Discovery Call Completed",
      description: "AI research brief generated & pain points identified",
      timestamp: new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  if (input.hasProposal || input.status === "proposal_sent" || input.status === "negotiation" || input.status === "won") {
    events.push({
      id: "evt-3",
      type: "proposal_sent",
      title: "Proposal Blueprint Delivered",
      description: "Custom scope and pricing specifications delivered to client",
      timestamp: new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const now = Date.now();
  const lastUpdate = input.updatedAt ? new Date(input.updatedAt).getTime() : createdDate.getTime();
  const daysInStage = Math.max(1, Math.round((now - lastUpdate) / (1000 * 60 * 60 * 24)));

  let velocity: "High" | "Normal" | "Stalled";
  let momentumScore = 75;

  if (daysInStage <= 3) {
    velocity = "High";
    momentumScore += 15;
  } else if (daysInStage > 10) {
    velocity = "Stalled";
    momentumScore -= 30;
  } else {
    velocity = "Normal";
  }

  if ((input.engagementCount || 0) > 3) momentumScore += 10;
  momentumScore = Math.min(100, Math.max(10, momentumScore));

  return {
    events,
    momentumScore,
    daysInStage,
    velocity
  };
}
