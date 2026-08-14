/**
 * Phase 14 — Feature 7: Autonomous Pipeline Agent
 * Master Pipeline Acceleration Orchestrator combining account prioritization, reactivation opportunities,
 * champion identification, stakeholder multithreading coverage, and pipeline gap analysis into a unified strategy.
 */

import { calculateAccountPriority } from "./account-prioritization";
import { createReactivationOpportunity } from "./opportunity-creation-engine";
import { identifyAccountChampion } from "./champion-engine";
import { evaluateMultithreadingCoverage } from "./multithreading-engine";
import { analyzePipelineGaps } from "./pipeline-gap-analyzer";

export interface PipelineAgentReport {
  topAccounts: any[];
  reactivationTargets: any[];
  pipelineRisks: any[];
  recommendedActions: string[];
  projectedPipelineLift: number;
}

export async function runPipelineAgent(): Promise<PipelineAgentReport> {
  const { db } = await import("./db");
  const leads = await db.getLeads();

  const topAccounts: any[] = [];
  const reactivationTargets: any[] = [];
  const pipelineRisks: any[] = [];
  const recommendedActions: string[] = [];

  for (const lead of leads) {
    // Account Prioritization
    const priority = calculateAccountPriority({
      leadId: lead.id,
      companyName: lead.company_name || lead.name,
      revenueEstimate: 2500000,
      intentScore: lead.lead_score || 75,
      icpScore: 85,
      hasMeetingHistory: true
    });

    await db.saveAccountPriority({
      lead_id: lead.id,
      score: priority.score,
      tier: priority.tier,
      reasoning: priority.reasoning
    });

    if (priority.tier === "Tier 1" || priority.tier === "Tier 2") {
      topAccounts.push({
        lead,
        priority
      });
    }

    // Opportunity Reactivation
    if (lead.status === "proposal_sent" || lead.status === "discovery_completed" || lead.status === "new") {
      const reactivation = createReactivationOpportunity(lead);
      await db.saveReactivationOpportunity({
        lead_id: lead.id,
        reactivation_probability: reactivation.reactivationProbability,
        outreach_strategy: reactivation.outreachStrategy,
        recommended_offer: reactivation.recommendedOffer,
        next_actions: reactivation.nextActions
      });

      reactivationTargets.push({
        lead,
        reactivation
      });
    }

    // Champion Detection
    const champion = identifyAccountChampion({
      leadName: lead.name,
      companyName: lead.company_name || "Company"
    });

    await db.saveChampionReport({
      lead_id: lead.id,
      champion_name: champion.champion,
      influence_score: champion.influenceScore,
      relationship_strength: champion.relationshipStrength,
      engagement_plan: champion.engagementPlan
    });

    // Multithreading Coverage
    const coverage = evaluateMultithreadingCoverage({
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.company_name || "Company",
      contactCount: 1
    });

    await db.saveStakeholderCoverageReport({
      lead_id: lead.id,
      coverage_score: coverage.coverageScore,
      risks: coverage.risks,
      missing_stakeholders: coverage.missingStakeholders,
      recommendations: coverage.recommendations
    });

    if (coverage.risks.length > 0) {
      pipelineRisks.push({
        lead,
        coverage
      });
    }
  }

  // Pipeline Gap Analysis
  const gapReport = analyzePipelineGaps(leads);
  await db.savePipelineAnalysisReport({
    industry_concentration: gapReport.industryConcentration,
    stage_distribution: gapReport.stageDistribution,
    revenue_target_gap: gapReport.revenueTargetGap,
    recommendations: gapReport.recommendations
  });

  recommendedActions.push(...gapReport.recommendations);
  if (reactivationTargets.length > 0) {
    recommendedActions.push(`Resurrect ${reactivationTargets.length} dormant leads with custom ROI offers`);
  }
  if (pipelineRisks.length > 0) {
    recommendedActions.push(`Multithread ${pipelineRisks.length} single-threaded accounts by introducing Executive Sponsors`);
  }

  const projectedPipelineLift = reactivationTargets.length * 12500 + topAccounts.length * 8500;

  return {
    topAccounts,
    reactivationTargets,
    pipelineRisks,
    recommendedActions: Array.from(new Set(recommendedActions)),
    projectedPipelineLift
  };
}
