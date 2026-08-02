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
    slug: "cadence-health-prior-auth",
    client: "Cadence Health",
    industry: "Healthcare",
    service: "AI Automation",
    title: "Cutting prior authorization from nine days to two",
    summary:
      "A 240-provider network was losing clinician time and revenue to a manual prior-authorization process. We rebuilt it as an instrumented pipeline with clinician review gates.",
    challenge:
      "Prior authorization consumed 31 hours of staff time per weekday across 14 coordinators. Packets were assembled by hand from three systems, submitted through six payer portals, and chased by phone. Average turnaround was nine business days, and 22% of denials were traced to missing documentation rather than clinical grounds.",
    legacyWorkflow: [
      { step: "Request intake", detail: "Fax and portal requests triaged manually into a shared inbox", cost: "3.5 hrs/day" },
      { step: "Chart assembly", detail: "Coordinator pulls notes, labs, and imaging from three systems", cost: "11 hrs/day" },
      { step: "Payer submission", detail: "Re-typing into six different payer portals", cost: "8 hrs/day" },
      { step: "Status chasing", detail: "Phone follow-up on every open case, every 48 hours", cost: "6 hrs/day" },
      { step: "Denial rework", detail: "Manual reassembly and resubmission", cost: "2.5 hrs/day" },
    ],
    solution:
      "We built a single authorization workspace on top of the existing EHR. Requests are classified on arrival, packets are assembled automatically against payer-specific requirement rules, and a clinician approves each submission in one screen. Status polling and denial classification run continuously.",
    solutionPillars: [
      { title: "Requirement rules engine", body: "Payer requirements encoded as versioned, testable rules — not tribal knowledge." },
      { title: "Automated packet assembly", body: "Structured and unstructured chart data extracted with provenance on every field." },
      { title: "One-screen clinician review", body: "Approve, amend, or reject with the full packet and rule trace visible." },
      { title: "Continuous status and denial handling", body: "Polling, classification, and appeal drafting with staff sign-off." },
    ],
    architecture: {
      layers: [
        { name: "Sources", nodes: ["Epic FHIR", "Fax gateway", "Payer portals", "Document store"] },
        { name: "Ingestion", nodes: ["Event router", "OCR + extraction", "PHI redaction"] },
        { name: "Core", nodes: ["Requirement rules engine", "Packet assembler", "Temporal workflows", "Audit ledger"] },
        { name: "Surfaces", nodes: ["Clinician review app", "Coordinator queue", "Ops dashboard"] },
      ],
      note: "Deployed inside the client VPC. No PHI leaves the boundary; model calls use redacted payloads with a signed BAA.",
    },
    timeline: [
      { phase: "Discovery & baseline", duration: "Weeks 1–2", detail: "Shadowed coordinators, instrumented current hours and denial causes." },
      { phase: "Rules & data foundation", duration: "Weeks 3–6", detail: "Payer rule encoding, FHIR integration, extraction pipeline." },
      { phase: "Review workspace", duration: "Weeks 7–10", detail: "Clinician and coordinator surfaces, audit ledger." },
      { phase: "Shadow mode", duration: "Weeks 11–13", detail: "Parallel run against manual process, accuracy tuned to 98.6%." },
      { phase: "Rollout", duration: "Weeks 14–16", detail: "Phased by specialty, training and runbook handover." },
    ],
    roi: [
      { value: "2 days", label: "Average turnaround", note: "down from 9 business days" },
      { value: "6,900", label: "Hours returned annually", note: "across 14 coordinators" },
      { value: "$1.8M", label: "Revenue recovered", note: "from denial reduction and faster scheduling" },
      { value: "-79%", label: "Documentation denials", note: "22% to 4.6% of submissions" },
    ],
    stack: ["TypeScript", "Temporal", "Postgres", "Epic FHIR", "Azure OpenAI", "React", "OpenTelemetry"],
    quote: {
      text: "The number that mattered was not the automation rate. It was that our coordinators stopped working evenings.",
      name: "Dr. Naomi Okafor",
      role: "Chief Medical Officer, Cadence Health",
    },
  },
  {
    slug: "ledgerline-close-automation",
    client: "Ledgerline",
    industry: "Financial Services",
    service: "Business Process Automation",
    title: "A fourteen-day close, rebuilt to run in three",
    summary:
      "A fintech lender's finance team spent half of every month reconciling. We made reconciliation continuous and turned close into a review, not a rebuild.",
    challenge:
      "Close took 14 business days. Four analysts reconciled bank, billing, and ledger data across 11 sources in spreadsheets. Every month produced roughly 400 unexplained variances discovered too late to fix cleanly, and the board pack was assembled by hand in the final 48 hours.",
    legacyWorkflow: [
      { step: "Data pull", detail: "Manual exports from 11 systems into staging spreadsheets", cost: "2 days" },
      { step: "Matching", detail: "Formula-based matching, re-keyed each month", cost: "5 days" },
      { step: "Variance research", detail: "Email threads chasing owners for explanations", cost: "4 days" },
      { step: "Journal entries", detail: "Manual entry with a second-analyst check", cost: "1.5 days" },
      { step: "Board pack", detail: "Charts rebuilt and commentary written from scratch", cost: "1.5 days" },
    ],
    solution:
      "We built a governed warehouse with daily automated matching, an exception workspace with aging and ownership, and a board pack that regenerates itself with drafted variance commentary the controller edits.",
    solutionPillars: [
      { title: "Governed data layer", body: "All 11 sources landed and tested with dbt contracts and freshness alerts." },
      { title: "Continuous matching", body: "Daily multi-way reconciliation, so exceptions surface within 24 hours of occurring." },
      { title: "Exception workspace", body: "Owned, aged, and SLA-tracked variances with resolution history retained." },
      { title: "Self-assembling reporting", body: "Board pack and commentary generated from the warehouse, controller-approved." },
    ],
    architecture: {
      layers: [
        { name: "Sources", nodes: ["Stripe", "Core ledger", "Bank APIs", "NetSuite", "Ramp"] },
        { name: "Pipeline", nodes: ["Airbyte ingestion", "dbt models", "Data tests", "Freshness monitors"] },
        { name: "Core", nodes: ["Matching engine", "Exception service", "Commentary generator", "Approval log"] },
        { name: "Surfaces", nodes: ["Exception workspace", "Close dashboard", "Board pack"] },
      ],
      note: "Every automated journal entry carries a lineage reference from source row to posted figure.",
    },
    timeline: [
      { phase: "Assessment", duration: "Weeks 1–2", detail: "Mapped 11 sources, quantified variance categories." },
      { phase: "Warehouse build", duration: "Weeks 3–7", detail: "Ingestion, models, tests, and freshness monitoring." },
      { phase: "Matching engine", duration: "Weeks 8–11", detail: "Rule library, tolerance logic, exception service." },
      { phase: "Reporting", duration: "Weeks 12–14", detail: "Close dashboard and generated board pack." },
      { phase: "Parallel close", duration: "Weeks 15–18", detail: "Two months run in parallel before cutover." },
    ],
    roi: [
      { value: "3 days", label: "Close duration", note: "down from 14 business days" },
      { value: "97%", label: "Auto-matched transactions", note: "at go-live, 98.4% after tuning" },
      { value: "4,300", label: "Analyst hours returned", note: "reallocated to FP&A work" },
      { value: "$640k", label: "Annual cost avoided", note: "two planned hires no longer needed" },
    ],
    stack: ["dbt", "Snowflake", "Airbyte", "Python", "TypeScript", "React", "Anthropic"],
    quote: {
      text: "We hired analysts to do analysis. For the first time, that's what they spend the month doing.",
      name: "Priya Raman",
      role: "VP Finance, Ledgerline",
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
      { step: "List building", detail: "Each rep researching accounts in spreadsheets", cost: "9 hrs/rep/week" },
      { step: "Sequencing", detail: "Ad-hoc templates, no version control or testing", cost: "Untracked" },
      { step: "Inbound routing", detail: "Manual assignment with no SLA", cost: "31 hrs median response" },
      { step: "Reporting", detail: "Two conflicting attribution models", cost: "3 days/month" },
    ],
    solution:
      "We built an account and signal graph feeding a tested outbound system, sub-minute inbound routing with SLA enforcement, and one warehouse attribution model both teams agreed to.",
    solutionPillars: [
      { title: "Signal graph", body: "Hiring, funding, tech-stack, and product-usage signals scored into a live ICP model." },
      { title: "Tested outbound", body: "Versioned sequences with holdouts, deliverability monitoring, and reply classification." },
      { title: "Routing with teeth", body: "Sub-minute assignment, SLA alerts, and manager-visible enforcement." },
      { title: "Single attribution model", body: "Multi-touch model in the warehouse, signed off by both CRO and CFO." },
    ],
    architecture: {
      layers: [
        { name: "Signals", nodes: ["Clay enrichment", "Job posting feeds", "Product usage events", "Web intent"] },
        { name: "Pipeline", nodes: ["Scoring service", "Segment router", "dbt models"] },
        { name: "Execution", nodes: ["Sequence engine", "Deliverability monitor", "Reply classifier", "HubSpot sync"] },
        { name: "Surfaces", nodes: ["Rep worklist", "SLA monitor", "Attribution dashboard"] },
      ],
      note: "Reps see a ranked worklist rather than a list to build. Every touch is written back for attribution.",
    },
    timeline: [
      { phase: "Audit", duration: "Weeks 1–2", detail: "Funnel analysis, data quality assessment, ICP interviews." },
      { phase: "Data & scoring", duration: "Weeks 3–5", detail: "Signal ingestion and ICP scoring model." },
      { phase: "Execution layer", duration: "Weeks 6–8", detail: "Sequence engine, routing, reply classification." },
      { phase: "Attribution", duration: "Weeks 9–10", detail: "Warehouse model and dashboards, joint sign-off." },
      { phase: "Optimization", duration: "Ongoing", detail: "Monthly test cycles on message and segment." },
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
      { step: "Triage", detail: "Manual categorization and priority assignment", cost: "4 hrs/day" },
      { step: "Research", detail: "Agents searching PDFs, wiki, and old tickets", cost: "22 min/ticket" },
      { step: "Response drafting", detail: "Written from scratch, quality varied by agent", cost: "11 min/ticket" },
      { step: "Escalation", detail: "Context lost on handoff to engineering", cost: "2.3 day delay" },
    ],
    solution:
      "A tool-using support agent grounded in versioned product documentation, with typed tools for order lookup, firmware history, and RMA creation — plus confidence-based escalation carrying full context.",
    solutionPillars: [
      { title: "Version-aware retrieval", body: "Answers scoped to the customer's exact hardware revision and firmware." },
      { title: "Typed tools with scoped permissions", body: "Order lookup, RMA creation, and diagnostics as audited, rate-limited tools." },
      { title: "Evaluation in CI", body: "1,200-case golden set gating every prompt and model change." },
      { title: "Context-preserving escalation", body: "Engineering receives the full trace, not a summary." },
    ],
    architecture: {
      layers: [
        { name: "Knowledge", nodes: ["Product manuals", "Firmware notes", "Ticket history", "Wiki"] },
        { name: "Retrieval", nodes: ["Chunking + versioning", "pgvector index", "Provenance store"] },
        { name: "Agent core", nodes: ["LangGraph orchestrator", "Tool registry", "Policy guard", "Audit ledger"] },
        { name: "Surfaces", nodes: ["Zendesk integration", "Customer portal", "Engineering escalation queue"] },
      ],
      note: "Destructive tools (RMA, credit) require human approval. Every action is logged with the reasoning trace.",
    },
    timeline: [
      { phase: "Knowledge audit", duration: "Weeks 1–3", detail: "Source inventory, versioning strategy, golden set creation." },
      { phase: "Retrieval build", duration: "Weeks 4–6", detail: "Indexing pipeline with revision awareness." },
      { phase: "Agent build", duration: "Weeks 7–10", detail: "Tools, policy guard, escalation, audit ledger." },
      { phase: "Supervised pilot", duration: "Weeks 11–13", detail: "Draft-only mode reviewed by agents, accuracy tuned to 94%." },
      { phase: "Autonomy rollout", duration: "Weeks 14–17", detail: "Category-by-category autonomy expansion." },
    ],
    roi: [
      { value: "78%", label: "Tickets auto-resolved", note: "tier-1 categories" },
      { value: "4 min", label: "First response time", note: "down from 14 hours" },
      { value: "$0.03", label: "Cost per resolution", note: "versus $6.40 fully loaded" },
      { value: "+21", label: "CSAT points", note: "measured on auto-resolved tickets" },
    ],
    stack: ["TypeScript", "LangGraph", "pgvector", "Anthropic", "Zendesk", "Postgres", "OpenTelemetry"],
    quote: {
      text: "We expected customers to resent the agent. Satisfaction went up, because it answers in four minutes and it is never wrong about firmware.",
      name: "Elena Vasquez",
      role: "VP Customer Experience, Volta Robotics",
    },
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
