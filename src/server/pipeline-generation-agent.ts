/**
 * Autonomous Pipeline Generation System — PART 7: Pipeline Generation Orchestrator
 * Central AI SDR workflow driving automated outbound pipeline generation:
 * 1. Discover prospects
 * 2. Run research
 * 3. Detect intent
 * 4. Calculate ICP fit
 * 5. Score prospects
 * 6. Save records & auto-convert Hot prospects to CRM leads
 */

import { discoverProspects, ProspectDiscoveryInput } from "./prospect-discovery-agent";
import { runProspectResearchAgent } from "./prospect-research-agent";
import { detectIntentSignals } from "./intent-signal-engine";
import { calculateICPMatch } from "./icp-matching-engine";
import { calculateProspectScore } from "./prospect-scoring-engine";

export interface PipelineGenerationReport {
  prospectsFound: number;
  hotProspects: number;
  warmProspects: number;
  averageScore: number;
  opportunities: any[];
}

export async function runPipelineGenerationAgent(
  input?: ProspectDiscoveryInput
): Promise<PipelineGenerationReport> {
  const { db } = await import("./db");

  // 1. Discover prospects
  const discoveredAccounts = await discoverProspects(input || {});
  const opportunities: any[] = [];
  let totalScore = 0;
  let hotCount = 0;
  let warmCount = 0;

  for (const account of discoveredAccounts) {
    // 2. Run research
    const research = await runProspectResearchAgent({
      companyName: account.company_name,
      industry: account.industry,
      employeeCount: account.employee_count,
      website: account.website
    });

    // 3. Detect intent
    const intentReport = detectIntentSignals({
      companyName: account.company_name,
      industry: account.industry,
      website: account.website
    });

    // 4. Calculate ICP fit
    const icpReport = calculateICPMatch({
      industry: account.industry,
      company_size: account.employee_count,
      revenue: account.annual_revenue_estimate
    });

    // 5. Score prospect
    const scoreReport = calculateProspectScore({
      icpScore: icpReport.score,
      intentScore: intentReport.score,
      employeeCount: account.employee_count,
      revenueEstimate: account.annual_revenue_estimate,
      hasResearch: true
    });

    totalScore += scoreReport.score;
    if (scoreReport.category === "Hot") hotCount++;
    else if (scoreReport.category === "Warm") warmCount++;

    // 6. Save records in DB
    const savedAccount = await db.saveProspectAccount(account);

    if (account.contacts && account.contacts.length > 0) {
      for (const contact of account.contacts) {
        await db.saveProspectContact({
          ...contact,
          prospect_account_id: savedAccount.id
        });
      }
    }

    await db.saveProspectResearchReport({
      prospect_account_id: savedAccount.id,
      company_summary: research.companySummary,
      pain_points: research.painPoints,
      ai_opportunities: research.automationOpportunities,
      growth_signals: research.growthSignals,
      recommended_angle: research.recommendedAngle
    });

    for (const signal of intentReport.signals) {
      await db.saveIntentSignal({
        prospect_account_id: savedAccount.id,
        signal_type: signal.type,
        signal_strength: signal.strength,
        signal_source: signal.source
      });
    }

    await db.saveProspectScore({
      prospect_account_id: savedAccount.id,
      score: scoreReport.score,
      category: scoreReport.category,
      reasoning: scoreReport.reasoning
    });

    // 7. Auto-convert Hot prospects to CRM Leads for Account Executive execution
    if (scoreReport.category === "Hot" && account.contacts?.[0]) {
      const primaryContact = account.contacts[0];
      await db.updateLeadMetadata(`lead-outbound-${savedAccount.id}`, {
        name: primaryContact.name,
        email: primaryContact.email,
        company_name: account.company_name,
        source: "outbound_ai_sdr",
        service_interest: account.industry,
        problem_description: research.painPoints.join("; "),
        status: "new",
        lead_score: scoreReport.score,
        lead_score_reason: `Outbound AI SDR Qualified: ${scoreReport.category} prospect (${scoreReport.score}/100)`
      });
    }

    opportunities.push({
      account: savedAccount,
      research,
      intentReport,
      icpReport,
      scoreReport
    });
  }

  const averageScore = discoveredAccounts.length > 0 ? Math.round(totalScore / discoveredAccounts.length) : 0;

  return {
    prospectsFound: discoveredAccounts.length,
    hotProspects: hotCount,
    warmProspects: warmCount,
    averageScore,
    opportunities
  };
}
