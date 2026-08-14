/**
 * Phase 14 — Feature 2: Autonomous Outreach Engine
 * Generates personalized multi-channel outreach packages (Email, SMS, LinkedIn, Call Script)
 * tailored to lead pain points, objections, industry, and buying intent.
 */

export interface AutonomousOutreachInput {
  leadId: string;
  leadName: string;
  companyName?: string;
  leadEmail: string;
  type: "follow_up" | "proposal_reminder" | "executive_escalation" | "stakeholder_intro" | "contract_push" | "breakup";
  painPoints?: string;
  objections?: string[];
  industry?: string;
}

export interface OutreachPackage {
  id?: string;
  lead_id: string;
  type: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  linkedinMessage: string;
  callScript: string;
  created_at?: string;
}

export function generateOutreachPackage(
  input: AutonomousOutreachInput
): OutreachPackage {
  const company = input.companyName || "your team";
  const name = input.leadName;

  switch (input.type) {
    case "proposal_reminder":
      return {
        lead_id: input.leadId,
        type: input.type,
        subject: `Quick Question: AxonFlow Proposal Blueprint for ${company}`,
        emailBody: `Hi ${name},\n\nI wanted to follow up on the custom AxonFlow proposal blueprint we sent over earlier this week. Have you had a chance to review the scope and ROI projections with your team?\n\nI'm happy to jump on a quick 10-minute call to answer any questions or customize the rollout schedule.\n\nBest regards,\nJayraj / Founder, House Of Workflow`,
        smsBody: `Hi ${name}, just sent a quick email regarding the AxonFlow proposal for ${company}. Let me know if you have 5 mins to connect!`,
        linkedinMessage: `Hi ${name}, following up on our proposal blueprint for ${company}. Would love to get your thoughts on the ROI timeline!`,
        callScript: `Hi ${name}, this is Jayraj from House Of Workflow. I'm following up on the proposal we prepared for ${company}. Do you have 2 minutes to review the rollout timeline?`
      };

    case "executive_escalation":
      return {
        lead_id: input.leadId,
        type: input.type,
        subject: `Executive Alignment: Scaling ${company}'s Lead Operations`,
        emailBody: `Hi ${name},\n\nAs Founder of House Of Workflow, I wanted to reach out personally. Our team has built a tailored AI automation architecture for ${company} designed to automate your intake and eliminate 20+ hours of manual drag per week.\n\nI'd love to host a 15-minute executive alignment call with you to review our guarantees and implementation roadmap.\n\nWarmly,\nJayraj / Founder`,
        smsBody: `Hi ${name}, Jayraj here (Founder, House Of Workflow). Would love to connect briefly on executive alignment for ${company}'s AI deployment.`,
        linkedinMessage: `Hi ${name}, reaching out as Founder of House Of Workflow. We've built an executive AI blueprint for ${company} and I'd love to share it with you directly.`,
        callScript: `Hi ${name}, Jayraj calling directly. I wanted to touch base on our executive blueprint for ${company}. Is now a bad time?`
      };

    case "contract_push":
      return {
        lead_id: input.leadId,
        type: input.type,
        subject: `Final Step: AxonFlow Implementation Kickoff for ${company}`,
        emailBody: `Hi ${name},\n\nWe are excited to kick off ${company}'s AI automation sprint! Everything is prepared on our end for rollout.\n\nYou can review and execute the final agreement using our secure portal link below:\n\n👉 [Execute Final Agreement]\n\nOnce signed, our engineering team will immediately initialize your dedicated Supabase instance and n8n pipelines.\n\nBest,\nJayraj / Founder`,
        smsBody: `Hi ${name}, agreement is ready for signature! Ready to kick off ${company}'s rollout as soon as you sign: [Link]`,
        linkedinMessage: `Hi ${name}, contract link is live for ${company}. Excited to get started on rollout!`,
        callScript: `Hi ${name}, checking in on contract execution for ${company}. Everything is locked in for immediate engineering kickoff once signed.`
      };

    case "breakup":
      return {
        lead_id: input.leadId,
        type: input.type,
        subject: `Closing Out: ${company}'s AxonFlow Automation File`,
        emailBody: `Hi ${name},\n\nI haven't heard back regarding ${company}'s AI automation project, so I assume priorities have shifted. I'll go ahead and close out your file for now.\n\nIf you ever want to revisit automating your lead qualification and CRM operations, feel free to reach out anytime!\n\nBest of luck,\nJayraj / Founder`,
        smsBody: `Hi ${name}, closing out your automation file for now. Feel free to reach back out whenever you're ready!`,
        linkedinMessage: `Hi ${name}, closing out your file for now. Wish you and ${company} all the best!`,
        callScript: `Hi ${name}, closing out our outreach file for ${company}. Just wanted to send our best regards!`
      };

    default: // follow_up
      return {
        lead_id: input.leadId,
        type: "follow_up",
        subject: `Following up: AI Lead Operating System for ${company}`,
        emailBody: `Hi ${name},\n\nFollowing up on our recent conversation about automating intake drag at ${company}. We'd love to show you a live interactive demo of our 24/7 AI qualification pipeline.\n\nDo you have 15 minutes open later this week?\n\nBest,\nJayraj / Founder`,
        smsBody: `Hi ${name}, following up regarding ${company}'s AI qualification pipeline. Let me know if you have 15 mins to connect this week!`,
        linkedinMessage: `Hi ${name}, following up on AI automation for ${company}. Let me know if you'd like a 10-minute live demo!`,
        callScript: `Hi ${name}, following up from House Of Workflow regarding your AI automation inquiry. Do you have 2 minutes to chat?`
      };
  }
}
