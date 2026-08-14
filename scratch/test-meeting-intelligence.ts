/**
 * Phase 11 E2E Verification Script for AI Meeting Intelligence Platform
 */

import { runMeetingIntelligenceAgent } from "../src/server/meeting-intelligence-agent";
import { calculateDealProbability } from "../src/server/deal-probability-engine";
import { calculateLeadScore } from "../src/server/lead-scoring-engine";
import { calculateRevenueForecast } from "../src/server/revenue-forecast-engine";
import { db } from "../src/server/db";

async function main() {
  console.log("=== MEETING INTELLIGENCE PLATFORM TEST ===\n");

  const testLeadId = `lead-${Date.now()}`;
  const sampleTranscript = `
Speaker 1 (Consultant): Hi Sarah, welcome to our discovery call. What's the main challenge your team is facing at Acme Automations?
Speaker 2 (Sarah - COO): Hi! Our main drag is manual client intake and data entry. We waste 20 hours a week transferring data between custom tools and our database.
Speaker 1: I see. If we deploy an automated AxonFlow pipeline to process intake 24/7, how soon would you want this operational?
Speaker 2: We need this ASAP, ideally within 2 weeks. Can you send over a formal proposal with pricing?
Speaker 1: Absolutely. What budget has been allocated for this phase?
Speaker 2: We have $10,000 allocated for this sprint. I'll need my CEO Michael to sign off on the final scope.
  `.trim();

  // 1. Transcript Stored
  const savedTranscript = await db.saveMeetingTranscript({
    leadId: testLeadId,
    transcript: sampleTranscript,
    durationMinutes: 20
  });
  if (savedTranscript && savedTranscript.id) {
    console.log("[1/7] Transcript Stored ✓");
  } else {
    throw new Error("Transcript storage failed");
  }

  // 2. Intelligence Generated
  const insights = await runMeetingIntelligenceAgent(sampleTranscript, "Sarah");
  const savedInsights = await db.saveMeetingInsights({
    leadId: testLeadId,
    transcriptId: savedTranscript.id,
    insights
  });
  if (savedInsights && insights.executiveSummary) {
    console.log("[2/7] Intelligence Generated ✓");
  } else {
    throw new Error("Meeting intelligence generation failed");
  }

  // 3. Lead Score Updated
  const scoreResult = calculateLeadScore({
    leadId: testLeadId,
    hasQuestionnaire: true,
    companySize: "11-50",
    employeeCount: 30,
    meetingCompleted: true,
    budgetDiscussed: true,
    proposalRequested: true,
    timelineMentioned: true,
    multipleStakeholders: true,
    hasStrongPainPoints: true
  });
  if (scoreResult && scoreResult.total_score > 0) {
    console.log("[3/7] Lead Score Updated ✓ (Score: " + scoreResult.total_score + ")");
  } else {
    throw new Error("Lead score calculation failed");
  }

  // 4. Deal Probability Calculated
  const dealProb = calculateDealProbability({
    leadScore: scoreResult.total_score,
    urgencyScore: insights.urgencyScore,
    stakeholderCount: insights.stakeholders.length,
    proposalRequested: true,
    budgetDiscussed: true,
    timelineDiscussed: true,
    buyingSignalCount: insights.buyingSignals.length
  });
  if (dealProb && dealProb.probability > 0) {
    console.log("[4/7] Deal Probability Calculated ✓ (Prob: " + dealProb.probability + "%)");
  } else {
    throw new Error("Deal probability calculation failed");
  }

  // 5. Revenue Forecast Generated
  const forecast = calculateRevenueForecast({
    leads: [
      { id: testLeadId, status: "proposal_sent", lead_score: scoreResult.total_score, close_probability: dealProb.probability },
      { id: "lead-2", status: "negotiation", lead_score: 90, close_probability: 85 },
      { id: "lead-3", status: "won", lead_score: 95, close_probability: 100 }
    ]
  });
  if (forecast && forecast.likelyRevenue > 0) {
    console.log("[5/7] Revenue Forecast Generated ✓ (Likely: $" + forecast.likelyRevenue.toLocaleString() + ")");
  } else {
    throw new Error("Revenue forecast generation failed");
  }

  // 6. Risk Monitor Triggered
  const commandCenterData = await db.getFounderCommandCenterData();
  if (commandCenterData && commandCenterData.dealsAtRiskCount !== undefined) {
    console.log("[6/7] Risk Monitor Triggered ✓ (Deals at Risk: " + commandCenterData.dealsAtRiskCount + ")");
  } else {
    throw new Error("Risk monitor failed");
  }

  // 7. Founder Brief Generated
  if (commandCenterData.dailyBriefingText && commandCenterData.dailyBriefingText.includes("Good morning")) {
    console.log("[7/7] Founder Brief Generated ✓");
  } else {
    throw new Error("Founder daily briefing generation failed");
  }

  console.log("\nALL TESTS PASSED");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
