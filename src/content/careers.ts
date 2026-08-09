export type Role = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  range: string;
  summary: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
};

export const roles: Role[] = [
  {
    slug: "senior-automation-engineer",
    title: "Senior Automation Engineer",
    team: "Delivery",
    location: "Remote (US / EU)",
    type: "Full-time",
    range: "$165,000 – $210,000",
    summary:
      "Design and ship the production systems at the centre of client engagements — integrations, workflow orchestration, and the surfaces operators live in.",
    about:
      "You will lead the technical build on two to three concurrent engagements, working directly with client operators and engineers. This is a senior role with real architectural authority and direct client exposure.",
    responsibilities: [
      "Own architecture and delivery for client automation systems end to end",
      "Design integration layers with contract tests against third-party systems",
      "Build operator-facing interfaces that people use all day without complaint",
      "Instrument everything: cost, latency, accuracy, and business outcome",
      "Pair with client engineers so ownership transfers cleanly at handover",
    ],
    requirements: [
      "6+ years building production TypeScript systems",
      "Deep Postgres experience and comfort with data modeling under real constraints",
      "Experience with workflow orchestration (Temporal, Step Functions, or equivalent)",
      "Clear written communication — our deliverables include documents, not just code",
    ],
    niceToHave: [
      "Worked in a consulting or agency delivery model before",
      "Experience with LLM evaluation and retrieval systems",
      "Background in operations before engineering",
    ],
  },
  {
    slug: "applied-ai-engineer",
    title: "Applied AI Engineer",
    team: "Applied AI",
    location: "Remote (US / EU)",
    type: "Full-time",
    range: "$175,000 – $225,000",
    summary:
      "Build agent systems that survive production: typed tools, permission models, retrieval quality, and evaluation harnesses that gate deploys.",
    about:
      "You will work on the hardest part of our engagements — making model-driven systems accountable. Expect to spend as much time on evaluation infrastructure as on prompts.",
    responsibilities: [
      "Design and ship tool-using agents with explicit permission models",
      "Build retrieval pipelines with provenance and version awareness",
      "Own evaluation harnesses, golden sets, and CI quality gates",
      "Drive cost and latency down without trading accuracy away",
      "Publish what you learn — our insights are written by the people who build",
    ],
    requirements: [
      "4+ years software engineering, 2+ shipping LLM-backed systems to production",
      "Strong opinions on evaluation, grounded in having been burned",
      "Comfort with Python or TypeScript to a production standard",
      "Ability to explain model behavior to a non-technical executive",
    ],
    niceToHave: [
      "Published research or writing on retrieval or agent evaluation",
      "Experience with regulated data environments",
    ],
  },
  {
    slug: "gtm-engineer",
    title: "GTM Engineer",
    team: "GTM Engineering",
    location: "Remote (US)",
    type: "Full-time",
    range: "$140,000 – $180,000",
    summary:
      "Build revenue infrastructure for clients: signal graphs, outbound systems, routing with SLAs, and attribution people actually trust.",
    about:
      "This role sits between engineering and revenue. You will build systems, not campaigns, and you will be measured on pipeline outcomes.",
    responsibilities: [
      "Build ICP scoring and signal ingestion pipelines",
      "Engineer outbound infrastructure including deliverability monitoring",
      "Implement routing, SLA enforcement, and warehouse attribution models",
      "Run test cycles on segmentation and messaging with real statistical discipline",
    ],
    requirements: [
      "3+ years in revenue operations or GTM engineering",
      "SQL fluency and comfort building in dbt",
      "Hands-on with HubSpot or Salesforce administration at depth",
      "Scripting ability in Python or TypeScript",
    ],
    niceToHave: [
      "Experience with Clay, Smartlead, or similar tooling at scale",
      "Prior sales or SDR experience",
    ],
  },
  {
    slug: "delivery-lead",
    title: "Delivery Lead",
    team: "Delivery",
    location: "Remote (US / EU)",
    type: "Full-time",
    range: "$150,000 – $195,000",
    summary:
      "Own client outcomes across engagements: scope, sequencing, stakeholder confidence, and the discipline that keeps projects honest.",
    about:
      "You will run three to four engagements, protecting both the client's outcome and the team's ability to do good work. Technical literacy is required; writing code is not.",
    responsibilities: [
      "Own scope, timeline, and commercial health across engagements",
      "Run diagnostics: shadow operators, quantify baselines, build the business case",
      "Manage executive stakeholders through shadow mode and cutover",
      "Protect the team from scope drift without becoming a bottleneck",
    ],
    requirements: [
      "5+ years delivering technical projects in a client-facing role",
      "Demonstrated ability to say no to an executive and keep the relationship",
      "Comfort reading architecture diagrams and challenging estimates",
    ],
    niceToHave: [
      "Operations background in a regulated industry",
      "Experience with process mapping methodologies",
    ],
  },
];

export const getRole = (slug: string) => roles.find((r) => r.slug === slug);

export const careerValues = [
  {
    title: "Small team, real ownership",
    body: "Nineteen people. You will own systems end to end and talk to the executives who depend on them.",
  },
  {
    title: "Measured, not mythologised",
    body: "We baseline our own work. Performance conversations use evidence, and so do promotion decisions.",
  },
  {
    title: "Depth over breadth",
    body: "We take fewer engagements than we could. The work is hard because it is not spread thin.",
  },
  {
    title: "Remote, with intent",
    body: "Async by default, two in-person weeks a year, and a genuine four-day-week pilot running since 2025.",
  },
];

export const benefits = [
  "Fully remote across US and EU time zones",
  "Four-day-week pilot, 32 hours, full pay",
  "$4,000 annual learning and conference budget",
  "Top-tier health, dental, and vision cover",
  "Home office and equipment allowance",
  "Twelve weeks parental leave, all parents",
  "Equity participation for every employee",
  "Two paid in-person team weeks per year",
];
