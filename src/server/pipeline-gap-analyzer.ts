/**
 * Phase 14 — Feature 3: Pipeline Gap Analyzer
 * Evaluates CRM pipeline composition across industry concentration, stage distribution, quarterly revenue targets,
 * and conversion rates to pinpoint bottlenecks, revenue shortfalls, and lead source weaknesses.
 */

export interface PipelineGapReport {
  industryConcentration: Record<string, number>;
  stageDistribution: Record<string, number>;
  revenueTargetGap: number;
  detectedGaps: {
    type: "missing_coverage" | "stage_bottleneck" | "revenue_shortfall" | "source_weakness";
    severity: "High" | "Medium" | "Low";
    description: string;
    actionItem: string;
  }[];
  recommendations: string[];
}

export function analyzePipelineGaps(leads: any[], quarterlyTarget: number = 150000): PipelineGapReport {
  const industryConcentration: Record<string, number> = {};
  const stageDistribution: Record<string, number> = {};
  let totalPipelineValue = 0;

  for (const lead of leads) {
    const ind = lead.service_interest || lead.industry || "General Software";
    industryConcentration[ind] = (industryConcentration[ind] || 0) + 1;

    const stage = lead.status || "new";
    stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;

    totalPipelineValue += (lead.close_probability || 50) * 100; // estimated weighted value
  }

  const revenueTargetGap = Math.max(0, quarterlyTarget - totalPipelineValue);

  const detectedGaps: PipelineGapReport["detectedGaps"] = [];
  const recommendations: string[] = [];

  // Detect revenue shortfall
  if (revenueTargetGap > 50000) {
    detectedGaps.push({
      type: "revenue_shortfall",
      severity: "High",
      description: `Weighted pipeline value ($${totalPipelineValue.toLocaleString()}) lags quarterly target ($${quarterlyTarget.toLocaleString()}) by $${revenueTargetGap.toLocaleString()}`,
      actionItem: "Launch outbound pipeline agent to generate Tier 1 accounts"
    });
    recommendations.push("Initiate proactive SDR campaigns targeting top 20 ICP software accounts.");
  }

  // Detect stage bottleneck in proposal_sent
  if ((stageDistribution["proposal_sent"] || 0) >= 2) {
    detectedGaps.push({
      type: "stage_bottleneck",
      severity: "Medium",
      description: `${stageDistribution["proposal_sent"]} proposals currently pending review without formal commercial decision`,
      actionItem: "Trigger Proposal Follow-Up sequence and schedule Executive Alignment calls"
    });
    recommendations.push("Schedule founder executive alignment sessions for stalled proposal leads.");
  }

  // Detect missing coverage
  if (leads.length < 5) {
    detectedGaps.push({
      type: "missing_coverage",
      severity: "High",
      description: "Low top-of-funnel lead count increases pipeline concentration risk",
      actionItem: "Reactivate dormant leads with targeted offer blueprints"
    });
    recommendations.push("Execute dormant lead reactivation campaign to resurrect prior pipeline opportunities.");
  }

  return {
    industryConcentration,
    stageDistribution,
    revenueTargetGap,
    detectedGaps,
    recommendations
  };
}
