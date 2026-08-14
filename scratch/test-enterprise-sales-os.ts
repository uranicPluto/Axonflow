/**
 * Comprehensive E2E Verification Script for Enterprise AI Meeting Prep & Sales OS
 */

import { enrichLeadProfile } from "../src/server/lead-enrichment";
import { runCompanyResearchAgent } from "../src/server/company-research-agent";
import { generateAIMeetingBrief } from "../src/server/ai-research";
import { calculateLeadScore } from "../src/server/lead-scoring-engine";
import { generateProposalRecommendation } from "../src/server/proposal-engine";
import { generateAIFollowUpEmail } from "../src/server/follow-up-engine";
import { db } from "../src/server/db";

async function main() {
  console.log("=== ENTERPRISE SALES OS INTEGRATION TEST ===");

  const testLeadId = `test-lead-${Date.now()}`;
  const companyName = "Acme Automations Inc";
  const email = "founder@acmeautomations.io";
  const website = "https://acmeautomations.io";

  // 1. Test Lead Enrichment Engine
  console.log("\n[1/7] Testing Lead Enrichment Engine...");
  const enrichment = await enrichLeadProfile({
    leadId: testLeadId,
    email,
    companyName,
    website
  });
  console.log("-> Enrichment Industry:", enrichment.industry);
  console.log("-> Enrichment Company Size:", enrichment.company_size);
  console.log("-> Enrichment Tech Stack:", enrichment.tech_stack.join(", "));

  // 2. Test Company Research Agent
  console.log("\n[2/7] Testing AI Company Research Agent...");
  const research = await runCompanyResearchAgent({
    leadId: testLeadId,
    companyName,
    website,
    industry: enrichment.industry
  });
  console.log("-> Company Summary:", research.company_summary.substring(0, 100) + "...");
  console.log("-> Recommended Pitch:", research.recommended_pitch);

  // 3. Test Discovery Brief 2.0
  console.log("\n[3/7] Testing Discovery Call Brief 2.0...");
  const brief = await generateAIMeetingBrief({
    leadName: "Sarah Connor",
    leadEmail: email,
    companyName,
    companyWebsite: website,
    serviceInterest: "AI Agent Sprint"
  });
  console.log("-> Brief Deal Score:", brief.deal_score);
  console.log("-> Recommended Package:", brief.recommended_service_package);

  // 4. Test Lead Scoring Engine
  console.log("\n[4/7] Testing AI Lead Scoring Engine...");
  const scoreResult = calculateLeadScore({
    leadId: testLeadId,
    hasQuestionnaire: true,
    questionnaireLength: 150,
    employeeCount: 35,
    urgency: "high",
    budgetSignal: "$10k",
    activityCount: 4
  });
  console.log("-> Calculated Score:", scoreResult.total_score, `/ 100 (${scoreResult.category})`);

  // 5. Test Proposal Intelligence Engine
  console.log("\n[5/7] Testing Proposal Intelligence Engine...");
  const proposal = await generateProposalRecommendation({
    leadId: testLeadId,
    leadName: "Sarah Connor",
    companyName,
    confirmedBudget: 7500,
    meetingNotes: "Wants end-to-end AI lead qualification with Slack alerts."
  });
  console.log("-> Proposed Package:", proposal.recommended_package);
  console.log("-> Price Range:", proposal.estimated_price_range);
  console.log("-> Deliverables Count:", proposal.deliverables.length);

  // 6. Test Automated Follow-Up Email Generator
  console.log("\n[6/7] Testing Automated Follow-Up Email Engine...");
  const followUp = await generateAIFollowUpEmail({
    leadId: testLeadId,
    leadName: "Sarah Connor",
    leadEmail: email,
    type: "recap",
    proposalPackage: proposal.recommended_package,
    proposedPrice: proposal.estimated_price_range
  });
  console.log("-> Generated Email Subject:", followUp.subject);

  // 7. Test DB Methods & Founder Command Center Data
  console.log("\n[7/7] Testing DB Processing & Founder Command Center Data...");
  const commandCenterData = await db.getFounderCommandCenterData();
  console.log("-> Daily Briefing Text:", commandCenterData.dailyBriefingText);
  console.log("-> Pipeline Value:", `$${commandCenterData.pipelineValue.toLocaleString()}`);

  console.log("\n✅ ALL 7 ENTERPRISE SALES OS MODULES VERIFIED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
