export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  service: string;
  title: string;
  summary: string;
  challenge: string;
  legacyWorkflow: { step: string; detail: string; cost: string }[];
  solution: string;
  solutionPillars: { title: string; body: string }[];
  architecture: {
    layers: { name: string; nodes: string[] }[];
    note: string;
  };
  timeline: { phase: string; duration: string; detail: string }[];
  roi: { value: string; label: string; note: string }[];
  stack: string[];
  quote: { text: string; name: string; role: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "saas-trial-qualification",
    client: "Clearbound",
    industry: "SaaS Startup",
    service: "AI Automation",
    title: "Lead qualification time cut from 72 hours to 4 hours",
    summary:
      "A B2B SaaS startup was manually qualifying every inbound trial signup. Sales reps spent 3 days chasing responses before a single demo could be booked. We built an automated qualification pipeline on n8n and OpenAI — leads scored, follow-ups sent within minutes, hot prospects routed directly to the sales calendar.",
    challenge:
      "With trial signups scaling 80% quarter-over-quarter, the sales team was overwhelmed. Lead scoring was manual and subjective, response times averaged 72 hours, and reps spent over 15 hours a week manually copy-pasting data and sending basic follow-up sequences. Over 40% of high-intent trials churned before booking a demo.",
    legacyWorkflow: [
      {
        step: "Lead intake",
        detail: "Trial signups dumped into Salesforce without enrichment",
        cost: "2 hrs/day",
      },
      {
        step: "Manual research",
        detail: "Reps looking up LinkedIn profiles and funding data",
        cost: "6 hrs/day",
      },
      {
        step: "Outreach writing",
        detail: "Drafting custom follow-ups for each signup",
        cost: "5 hrs/day",
      },
      {
        step: "Calendar booking",
        detail: "Back-and-forth emails to schedule demo calls",
        cost: "4 hrs/day",
      },
    ],
    solution:
      "We built a fully automated qualification and enrichment flow. Inbound signups are instantly enriched with Clay and Clearbit data, scored using custom criteria evaluated by OpenAI, and routed. Hot leads receive customized outreach sequences and self-booking links within 5 minutes of signing up, while low-intent signups are placed in automated nurture sequences.",
    solutionPillars: [
      {
        title: "Instant data enrichment",
        body: "Enriching signups with company size, funding, and tech stack in real-time.",
      },
      {
        title: "AI-driven scoring",
        body: "Scoring leads via OpenAI based on ideal customer profile (ICP) alignment.",
      },
      {
        title: "Sub-5 minute follow-up",
        body: "Triggering personalized email sequences via Smartlead immediately.",
      },
      {
        title: "Automated routing",
        body: "Routing qualified leads directly to the correct rep's booking calendar.",
      },
    ],
    architecture: {
      layers: [
        { name: "Sources", nodes: ["Stripe", "Salesforce", "Segment", "Clearbit", "Clay"] },
        { name: "Pipeline", nodes: ["n8n orchestrator", "OpenAI scoring", "Slack alerts"] },
        { name: "Execution", nodes: ["Smartlead sequence", "Cal.com routing", "HubSpot sync"] },
        { name: "Surfaces", nodes: ["AE Calendar", "Sales dashboard", "Admin portal"] },
      ],
      note: "Integrations are monitored for SLA compliance. Model prompts are cached to minimize API costs and latencies.",
    },
    timeline: [
      {
        phase: "Funnel audit",
        duration: "Weeks 1–2",
        detail: "Analyzed trial data, identified bottlenecks, mapped scoring rules.",
      },
      {
        phase: "Pipeline integration",
        duration: "Weeks 3–5",
        detail: "n8n workflow setup, enrichment data sources connection.",
      },
      {
        phase: "AI & scoring setup",
        duration: "Weeks 6–8",
        detail: "Configured OpenAI scoring prompt, tested on 1,000 historical leads.",
      },
      {
        phase: "Outreach & routing",
        duration: "Weeks 9–11",
        detail: "Connected Smartlead, setup routing rules and self-booking calendars.",
      },
      {
        phase: "Rollout & optimization",
        duration: "Weeks 12–14",
        detail: "Live run, A/B testing email templates, handover.",
      },
    ],
    roi: [
      { value: "4 hrs", label: "Qualification time", note: "was 72 hrs" },
      { value: "3.2x", label: "More demos booked per week", note: "increase in booking rate" },
      { value: "$240k", label: "Pipeline added", note: "in the first 90 days" },
      { value: "92%", label: "Manual task reduction", note: "for the sales development team" },
    ],
    stack: ["n8n", "OpenAI", "Salesforce", "TypeScript", "Clay", "Clearbit", "Smartlead"],
    quote: {
      text: "We were losing half our pipeline because we responded two days too late. Now, leads are booked on our calendar before the rep even opens their laptop.",
      name: "Sarah Jenkins",
      role: "VP of Sales, Clearbound",
    },
  },
  {
    slug: "agency-client-reporting",
    client: "Vantage Media",
    industry: "Digital Agency",
    service: "Business Process Automation",
    title: "Client reporting rebuilt from 12 hours to 20 minutes",
    summary:
      "A performance marketing agency manually pulled data from Google Ads, Meta, and client CRMs every week to build reports. We automated the entire pipeline — data pulled, cleaned, formatted, and delivered to every client every Monday at 8am. No one touches it.",
    challenge:
      "With over 50 active clients, preparing weekly performance reports was a operational bottleneck. Account managers spent their entire Thursdays and Fridays exporting CSVs, aligning dates, fixing currency conversions in spreadsheets, and manually copy-pasting charts into PDF templates. Humans frequently made copy-paste errors, leading to client disputes.",
    legacyWorkflow: [
      {
        step: "Data extraction",
        detail: "Manual CSV exports from Google Ads, Meta Ads, and GA4",
        cost: "5 hrs/week",
      },
      {
        step: "CRM data sync",
        detail: "Pulling lead status and revenue values from HubSpot/Salesforce",
        cost: "3 hrs/week",
      },
      {
        step: "Data consolidation",
        detail: "Merging sheets, adjusting timezones, and currency alignment",
        cost: "3 hrs/week",
      },
      {
        step: "Report assembly",
        detail: "Designing and copy-pasting charts into Google Slides decks",
        cost: "2 hrs/week",
      },
    ],
    solution:
      "We built a centralized data integration pipeline. An automated orchestrator pulls data hourly from advertising APIs and CRMs, stores it in a clean schema, and generates beautiful interactive dashboards. Reports are automatically compiled, QA-checked against predefined thresholds, and sent via Slack or Email at 8:00 AM every Monday.",
    solutionPillars: [
      {
        title: "API-first ingestion",
        body: "Direct native API connections to all major ad networks and CRM platforms.",
      },
      {
        title: "Automated QA checks",
        body: "Data validations verifying spend, impression counts, and conversion metrics.",
      },
      {
        title: "Dynamic dashboards",
        body: "Interactive client portals replacing static PDF reports entirely.",
      },
      {
        title: "Scheduled delivery",
        body: "Automated dispatch of customized summaries via Slack and Email.",
      },
    ],
    architecture: {
      layers: [
        { name: "Ad APIs", nodes: ["Google Ads", "Meta Ads", "TikTok Ads", "GA4"] },
        { name: "Pipeline", nodes: ["Fivetran ingestion", "BigQuery", "dbt transformations"] },
        {
          name: "Core",
          nodes: ["Currency converter", "QA checker", "Looker Studio API", "Email dispatch"],
        },
        { name: "Surfaces", nodes: ["Client portal", "Slack notifications", "AM admin panel"] },
      ],
      note: "Supports multi-currency conversion at historical daily rates automatically.",
    },
    timeline: [
      {
        phase: "Audit & schema design",
        duration: "Weeks 1–2",
        detail: "Mapped client data structures and ad platform APIs.",
      },
      {
        phase: "Pipeline build",
        duration: "Weeks 3–6",
        detail: "API connections, warehouse ingestion, and clean data modeling.",
      },
      {
        phase: "Reporting engine",
        duration: "Weeks 7–9",
        detail: "Dashboard template creation, automated PDF compilation.",
      },
      {
        phase: "QA & alerting",
        duration: "Weeks 10–11",
        detail: "Configured automated validation checks and notification routes.",
      },
      {
        phase: "Production rollout",
        duration: "Weeks 12–13",
        detail: "Gradual onboarding of clients, team training, handover.",
      },
    ],
    roi: [
      { value: "20 mins", label: "Full weekly report", note: "was 12+ hrs" },
      { value: "8 clients", label: "Served automatically", note: "every week" },
      { value: "100%", label: "Data accuracy", note: "zero manual errors" },
      { value: "$120k", label: "AM hours saved", note: "reallocated to growth strategy" },
    ],
    stack: ["Fivetran", "BigQuery", "dbt", "Python", "Looker Studio", "Slack API", "TypeScript"],
    quote: {
      text: "Reporting was the worst part of our team's week and the source of most client friction. Now it runs on autopilot, and our account managers focus entirely on strategy.",
      name: "Alex Mercer",
      role: "Founder, Vantage Media",
    },
  },
  {
    slug: "northwind-gtm-engine",
    client: "Northwind",
    industry: "SaaS",
    service: "GTM Engineering",
    title: "Tripling qualified pipeline without adding reps",
    summary:
      "A Series B infrastructure company had plateaued outbound. We rebuilt go-to-market as instrumented infrastructure and held headcount flat.",
    challenge:
      "Eight AEs sourced their own lists, wrote their own sequences, and logged their own activity. Meeting volume was flat for three quarters, cost per opportunity was rising, and marketing and sales attributed the same revenue two different ways.",
    legacyWorkflow: [
      {
        step: "List building",
        detail: "Each rep researching accounts in spreadsheets",
        cost: "9 hrs/rep/week",
      },
      {
        step: "Sequencing",
        detail: "Ad-hoc templates, no version control or testing",
        cost: "Untracked",
      },
      {
        step: "Inbound routing",
        detail: "Manual assignment with no SLA",
        cost: "31 hrs median response",
      },
      { step: "Reporting", detail: "Two conflicting attribution models", cost: "3 days/month" },
    ],
    solution:
      "We built an account and signal graph feeding a tested outbound system, sub-minute inbound routing with SLA enforcement, and one warehouse attribution model both teams agreed to.",
    solutionPillars: [
      {
        title: "Signal graph",
        body: "Hiring, funding, tech-stack, and product-usage signals scored into a live ICP model.",
      },
      {
        title: "Tested outbound",
        body: "Versioned sequences with holdouts, deliverability monitoring, and reply classification.",
      },
      {
        title: "Routing with teeth",
        body: "Sub-minute assignment, SLA alerts, and manager-visible enforcement.",
      },
      {
        title: "Single attribution model",
        body: "Multi-touch model in the warehouse, signed off by both CRO and CFO.",
      },
    ],
    architecture: {
      layers: [
        {
          name: "Signals",
          nodes: ["Clay enrichment", "Job posting feeds", "Product usage events", "Web intent"],
        },
        { name: "Pipeline", nodes: ["Scoring service", "Segment router", "dbt models"] },
        {
          name: "Execution",
          nodes: ["Sequence engine", "Deliverability monitor", "Reply classifier", "HubSpot sync"],
        },
        { name: "Surfaces", nodes: ["Rep worklist", "SLA monitor", "Attribution dashboard"] },
      ],
      note: "Reps see a ranked worklist rather than a list to build. Every touch is written back for attribution.",
    },
    timeline: [
      {
        phase: "Audit",
        duration: "Weeks 1–2",
        detail: "Funnel analysis, data quality assessment, ICP interviews.",
      },
      {
        phase: "Data & scoring",
        duration: "Weeks 3–5",
        detail: "Signal ingestion and ICP scoring model.",
      },
      {
        phase: "Execution layer",
        duration: "Weeks 6–8",
        detail: "Sequence engine, routing, reply classification.",
      },
      {
        phase: "Attribution",
        duration: "Weeks 9–10",
        detail: "Warehouse model and dashboards, joint sign-off.",
      },
      {
        phase: "Optimization",
        duration: "Ongoing",
        detail: "Monthly test cycles on message and segment.",
      },
    ],
    roi: [
      { value: "3.1x", label: "Qualified meetings", note: "same eight AEs" },
      { value: "-48%", label: "Cost per opportunity", note: "blended across channels" },
      { value: "52 sec", label: "Inbound response time", note: "down from 31 hours" },
      { value: "$4.2M", label: "Net-new pipeline", note: "in the two quarters post-launch" },
    ],
    stack: ["Clay", "TypeScript", "BigQuery", "dbt", "HubSpot", "Smartlead", "Metabase"],
    quote: {
      text: "Our reps stopped being researchers. The pipeline number moved the quarter after that.",
      name: "Marcus Feld",
      role: "CRO, Northwind",
    },
  },
  {
    slug: "volta-support-agents",
    client: "Volta Robotics",
    industry: "Manufacturing",
    service: "AI Agents",
    title: "Resolving 78% of support tickets without a human",
    summary:
      "A robotics manufacturer's support queue grew faster than its team. We deployed audited agents with strict escalation and product-grounded retrieval.",
    challenge:
      "Support volume doubled in a year. 61% of tickets were repeat questions answerable from manuals and firmware notes, but the knowledge was scattered across PDFs, a wiki, and eight years of ticket history. First response averaged 14 hours.",
    legacyWorkflow: [
      {
        step: "Triage",
        detail: "Manual categorization and priority assignment",
        cost: "4 hrs/day",
      },
      {
        step: "Research",
        detail: "Agents searching PDFs, wiki, and old tickets",
        cost: "22 min/ticket",
      },
      {
        step: "Response drafting",
        detail: "Written from scratch, quality varied by agent",
        cost: "11 min/ticket",
      },
      {
        step: "Escalation",
        detail: "Context lost on handoff to engineering",
        cost: "2.3 day delay",
      },
    ],
    solution:
      "A tool-using support agent grounded in versioned product documentation, with typed tools for order lookup, firmware history, and RMA creation — plus confidence-based escalation carrying full context.",
    solutionPillars: [
      {
        title: "Version-aware retrieval",
        body: "Answers scoped to the customer's exact hardware revision and firmware.",
      },
      {
        title: "Typed tools with scoped permissions",
        body: "Order lookup, RMA creation, and diagnostics as audited, rate-limited tools.",
      },
      {
        title: "Evaluation in CI",
        body: "1,200-case golden set gating every prompt and model change.",
      },
      {
        title: "Context-preserving escalation",
        body: "Engineering receives the full trace, not a summary.",
      },
    ],
    architecture: {
      layers: [
        {
          name: "Knowledge",
          nodes: ["Product manuals", "Firmware notes", "Ticket history", "Wiki"],
        },
        {
          name: "Retrieval",
          nodes: ["Chunking + versioning", "pgvector index", "Provenance store"],
        },
        {
          name: "Agent core",
          nodes: ["LangGraph orchestrator", "Tool registry", "Policy guard", "Audit ledger"],
        },
        {
          name: "Surfaces",
          nodes: ["Zendesk integration", "Customer portal", "Engineering escalation queue"],
        },
      ],
      note: "Destructive tools (RMA, credit) require human approval. Every action is logged with the reasoning trace.",
    },
    timeline: [
      {
        phase: "Knowledge audit",
        duration: "Weeks 1–3",
        detail: "Source inventory, versioning strategy, golden set creation.",
      },
      {
        phase: "Retrieval build",
        duration: "Weeks 4–6",
        detail: "Indexing pipeline with revision awareness.",
      },
      {
        phase: "Agent build",
        duration: "Weeks 7–10",
        detail: "Tools, policy guard, escalation, audit ledger.",
      },
      {
        phase: "Supervised pilot",
        duration: "Weeks 11–13",
        detail: "Draft-only mode reviewed by agents, accuracy tuned to 94%.",
      },
      {
        phase: "Autonomy rollout",
        duration: "Weeks 14–17",
        detail: "Category-by-category autonomy expansion.",
      },
    ],
    roi: [
      { value: "78%", label: "Tickets auto-resolved", note: "tier-1 categories" },
      { value: "4 min", label: "First response time", note: "down from 14 hours" },
      { value: "$0.03", label: "Cost per resolution", note: "versus $6.40 fully loaded" },
      { value: "+21", label: "CSAT points", note: "measured on auto-resolved tickets" },
    ],
    stack: [
      "TypeScript",
      "LangGraph",
      "pgvector",
      "Anthropic",
      "Zendesk",
      "Postgres",
      "OpenTelemetry",
    ],
    quote: {
      text: "We expected customers to resent the agent. Satisfaction went up, because it answers in four minutes and it is never wrong about firmware.",
      name: "Elena Vasquez",
      role: "VP Customer Experience, Volta Robotics",
    },
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
