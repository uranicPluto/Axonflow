export type ServiceSlug =
  | "ai-automation"
  | "business-process-automation"
  | "ai-agents"
  | "custom-software"
  | "saas-development"
  | "crm"
  | "gtm-engineering"
  | "ai-consulting";

export type Service = {
  slug: ServiceSlug;
  name: string;
  kicker: string;
  headline: string;
  summary: string;
  outcomes: { value: string; label: string }[];
  capabilities: { title: string; body: string }[];
  deliverables: string[];
  stack: string[];
  engagement: string;
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "ai-automation",
    name: "AI Automation",
    kicker: "Systems that run without being asked",
    headline: "Automate the work that never should have been a job.",
    summary:
      "We find the repetitive, judgment-light work buried in your operations and rebuild it as instrumented automation with human checkpoints where they matter.",
    outcomes: [
      { value: "1,900+", label: "hours returned per year, median engagement" },
      { value: "6 wks", label: "from discovery to first production workflow" },
      { value: "99.4%", label: "task success rate after tuning" },
    ],
    capabilities: [
      {
        title: "Workflow archaeology",
        body: "We shadow the real process — not the documented one — and quantify the cost of each handoff before touching code.",
      },
      {
        title: "Deterministic spine, AI edges",
        body: "Business rules stay explicit and testable. Models handle extraction, classification, and drafting where variance is expected.",
      },
      {
        title: "Observability from day one",
        body: "Every run is logged, evaluated, and replayable. You can see exactly what fired, what it cost, and what it changed.",
      },
      {
        title: "Human-in-the-loop by design",
        body: "Approval gates, confidence thresholds, and escalation paths so automation earns autonomy incrementally.",
      },
    ],
    deliverables: [
      "Process map with hour and cost baselines",
      "Production automation suite with monitoring",
      "Evaluation harness and regression suite",
      "Runbook and internal enablement session",
    ],
    stack: ["TypeScript", "Temporal", "Postgres", "OpenAI", "Anthropic", "Zapier / n8n", "Segment"],
    engagement: "Fixed-scope build, 6–12 weeks, then optional operating retainer.",
    faqs: [
      {
        q: "Do you replace our existing tools?",
        a: "Almost never. We orchestrate what you already pay for and only build custom where the gap is structural.",
      },
      {
        q: "How do you prove the ROI?",
        a: "We baseline hours and cost before build, then instrument the same metrics in production. The dashboard is yours.",
      },
    ],
  },
  {
    slug: "business-process-automation",
    name: "Business Process Automation",
    kicker: "Operating systems, not point fixes",
    headline: "Rebuild the workflows your company actually runs on.",
    summary:
      "Order-to-cash, quote-to-contract, hire-to-onboard, ticket-to-resolution. We redesign end-to-end processes and make them measurable.",
    outcomes: [
      { value: "62%", label: "average cycle-time reduction" },
      { value: "4.1x", label: "throughput per operations headcount" },
      { value: "0", label: "spreadsheet handoffs left in scope" },
    ],
    capabilities: [
      {
        title: "End-to-end process design",
        body: "We model the full value stream, find the constraint, and sequence work so the bottleneck moves first.",
      },
      {
        title: "System-of-record discipline",
        body: "One authoritative source per entity, with contracts and sync guarantees between systems.",
      },
      {
        title: "Exception engineering",
        body: "Happy paths are easy. We design the 12% of cases that consume 70% of your team's time.",
      },
      {
        title: "Change management",
        body: "Rollout plans, shadow-mode periods, and training so adoption isn't left to chance.",
      },
    ],
    deliverables: [
      "Value-stream map with constraint analysis",
      "Target-state architecture",
      "Phased implementation with shadow-mode cutover",
      "Operational KPI dashboard",
    ],
    stack: ["Temporal", "dbt", "Postgres", "Airbyte", "Retool", "Slack", "Salesforce / HubSpot"],
    engagement: "Discovery sprint (2 weeks) then phased build, 3–6 months.",
    faqs: [
      {
        q: "What if our process isn't documented?",
        a: "That's typical, and it's our first deliverable. Discovery produces the map you never had.",
      },
      {
        q: "Can you work alongside our internal team?",
        a: "Yes. Most engagements are embedded, with your engineers pairing so ownership transfers cleanly.",
      },
    ],
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    kicker: "Scoped autonomy, audited",
    headline: "Agents that do real work and can prove what they did.",
    summary:
      "Narrow, tool-using agents with explicit permissions, evaluation, and escalation. Built for accountability, not demos.",
    outcomes: [
      { value: "78%", label: "of tier-1 tickets resolved without a human" },
      { value: "<2 s", label: "median tool-call latency in production" },
      { value: "100%", label: "of actions written to an audit trail" },
    ],
    capabilities: [
      {
        title: "Tool and permission design",
        body: "Every capability is an explicit, typed tool with scoped credentials and rate limits.",
      },
      {
        title: "Retrieval that stays fresh",
        body: "Incremental indexing across your sources with provenance on every answer.",
      },
      {
        title: "Evaluation harness",
        body: "Golden sets, adversarial cases, and CI gates so behavior changes are caught before shipping.",
      },
      {
        title: "Graceful escalation",
        body: "Agents hand off with full context when confidence drops. No silent failures.",
      },
    ],
    deliverables: [
      "Agent specification and permission matrix",
      "Production agent with monitoring and cost controls",
      "Eval suite with regression CI",
      "Escalation and audit tooling",
    ],
    stack: ["TypeScript", "LangGraph", "pgvector", "Anthropic", "OpenAI", "Redis", "OpenTelemetry"],
    engagement: "Pilot in 4 weeks, production hardening in 4–8 more.",
    faqs: [
      {
        q: "How do you prevent an agent going off-script?",
        a: "Capabilities are whitelisted, destructive actions require approval, and every run is evaluated against a golden set.",
      },
      {
        q: "Which model do you use?",
        a: "Whichever wins on your evals per task. We keep the routing layer swappable on purpose.",
      },
    ],
  },
  {
    slug: "custom-software",
    name: "Custom Software",
    kicker: "Built for how you actually work",
    headline: "Internal platforms that beat the workaround spreadsheet.",
    summary:
      "When off-the-shelf forces your team into someone else's model, we build the tool that fits — fast, typed, and maintainable.",
    outcomes: [
      { value: "9 wks", label: "median time to first production release" },
      { value: "-71%", label: "tool sprawl after consolidation" },
      { value: "A+", label: "handover: tests, docs, CI included" },
    ],
    capabilities: [
      {
        title: "Domain modeling first",
        body: "We get the entities and invariants right before the UI, so the system survives its second year.",
      },
      {
        title: "Interfaces operators love",
        body: "Keyboard-first, dense where density helps, and fast enough to live in all day.",
      },
      {
        title: "Integration layer",
        body: "Your ERP, CRM, warehouse, and vendors behind one contract-tested boundary.",
      },
      {
        title: "Maintainable handover",
        body: "Typed end-to-end, documented, CI-gated, and owned by your team when you want it.",
      },
    ],
    deliverables: [
      "Domain model and architecture decision records",
      "Production application with CI/CD",
      "Integration adapters and contract tests",
      "Handover documentation and training",
    ],
    stack: ["TypeScript", "React", "Postgres", "Prisma", "tRPC", "Playwright", "Vercel / AWS"],
    engagement: "Fixed-scope MVP then iteration cycles, 2–6 months.",
    faqs: [
      {
        q: "Do we own the code?",
        a: "Entirely, from the first commit, in your repository and your cloud account.",
      },
      { q: "Can you take over an existing codebase?", a: "Yes — we start with an audit and a stabilization plan." },
    ],
  },
  {
    slug: "saas-development",
    name: "SaaS Development",
    kicker: "Product to paying cohort",
    headline: "Ship a multi-tenant product that can take real customers.",
    summary:
      "Architecture, billing, auth, tenancy, and the AI surface that makes your product feel a generation ahead.",
    outcomes: [
      { value: "12 wks", label: "concept to first paying customers" },
      { value: "SOC 2", label: "ready foundations from the start" },
      { value: "3.4%", label: "median trial-to-paid lift after onboarding work" },
    ],
    capabilities: [
      {
        title: "Tenancy and permissions",
        body: "Row-level isolation, org hierarchies, and role models that don't need rewriting at scale.",
      },
      {
        title: "Billing and entitlements",
        body: "Usage metering, plans, seats, and upgrade paths wired to the product surface.",
      },
      {
        title: "AI-native surfaces",
        body: "Assistants, summarization, and automation inside your product, with per-tenant cost controls.",
      },
      {
        title: "Growth instrumentation",
        body: "Events, funnels, and activation metrics wired before launch, not after.",
      },
    ],
    deliverables: [
      "Product architecture and tenancy model",
      "Production app with billing and auth",
      "Analytics and activation instrumentation",
      "Launch and scaling playbook",
    ],
    stack: ["TypeScript", "React", "Postgres", "Stripe", "Clerk / Auth", "PostHog", "AWS"],
    engagement: "MVP in 10–14 weeks, then continuous delivery.",
    faqs: [
      { q: "Do you take equity?", a: "We work on cash terms; for select partners we blend a reduced rate with equity." },
      {
        q: "Will it scale past the MVP?",
        a: "The boring parts — tenancy, migrations, observability — are built properly precisely so you can grow into it.",
      },
    ],
  },
  {
    slug: "crm",
    name: "CRM Engineering",
    kicker: "A revenue system of record",
    headline: "Make your CRM the truth instead of the chore.",
    summary:
      "We rebuild your CRM around the way deals actually progress, enrich it automatically, and remove the data entry that kills adoption.",
    outcomes: [
      { value: "94%", label: "field completeness without manual entry" },
      { value: "+23%", label: "forecast accuracy within two quarters" },
      { value: "5 hrs", label: "returned per rep, per week" },
    ],
    capabilities: [
      {
        title: "Object and stage redesign",
        body: "Pipelines that reflect real buying behavior, with exit criteria a manager can inspect.",
      },
      {
        title: "Automatic enrichment",
        body: "Firmographics, signals, and activity captured from source systems, not typed by reps.",
      },
      {
        title: "Hygiene automation",
        body: "Dedupe, normalization, and decay rules running continuously in the background.",
      },
      {
        title: "Forecast and reporting layer",
        body: "Warehouse-backed reporting so board numbers and CRM numbers finally agree.",
      },
    ],
    deliverables: [
      "CRM data model and stage definitions",
      "Enrichment and hygiene automation",
      "Warehouse sync and reporting layer",
      "Rep enablement and adoption plan",
    ],
    stack: ["HubSpot", "Salesforce", "Snowflake / BigQuery", "dbt", "Clay", "Segment"],
    engagement: "Audit in 2 weeks, rebuild in 6–10 weeks.",
    faqs: [
      {
        q: "HubSpot or Salesforce?",
        a: "Whichever your motion needs. We've migrated both directions and will tell you honestly when a move isn't worth it.",
      },
      {
        q: "Will reps actually use it?",
        a: "Adoption follows from removing typing. If the CRM fills itself, the behavior problem mostly disappears.",
      },
    ],
  },
  {
    slug: "gtm-engineering",
    name: "GTM Engineering",
    kicker: "Pipeline as infrastructure",
    headline: "Treat go-to-market like a system, because it is one.",
    summary:
      "Data, signals, routing, sequencing, and attribution engineered as a single pipeline — measurable end to end.",
    outcomes: [
      { value: "3.1x", label: "qualified meetings from the same headcount" },
      { value: "-48%", label: "cost per opportunity" },
      { value: "Full", label: "multi-touch attribution to closed won" },
    ],
    capabilities: [
      {
        title: "Account and signal graph",
        body: "ICP scoring built on real intent signals, refreshed continuously.",
      },
      {
        title: "Outbound infrastructure",
        body: "Deliverability, sequencing, and personalization that survives volume.",
      },
      {
        title: "Routing and SLAs",
        body: "Inbound reaches the right rep in seconds, with enforcement and reporting.",
      },
      {
        title: "Attribution warehouse",
        body: "One model your CFO and CRO can both defend.",
      },
    ],
    deliverables: [
      "ICP and signal model",
      "Outbound and inbound infrastructure",
      "Routing rules with SLA monitoring",
      "Attribution dashboards",
    ],
    stack: ["Clay", "Apollo", "Smartlead", "HubSpot", "dbt", "BigQuery", "Metabase"],
    engagement: "Build in 6–8 weeks, then monthly optimization.",
    faqs: [
      { q: "Is this an agency retainer?", a: "No. We build the infrastructure and hand you the controls." },
      {
        q: "Do you write the copy?",
        a: "We build the system and the message-testing loop; your voice, tested against reply data.",
      },
    ],
  },
  {
    slug: "ai-consulting",
    name: "AI Consulting",
    kicker: "Judgment before spend",
    headline: "Know what to build, what to buy, and what to ignore.",
    summary:
      "A short, opinionated engagement that produces a costed roadmap, a governance model, and the confidence to commit.",
    outcomes: [
      { value: "3 wks", label: "to a costed, sequenced roadmap" },
      { value: "12–20", label: "opportunities scored per assessment" },
      { value: "1", label: "clear first project, de-risked" },
    ],
    capabilities: [
      {
        title: "Opportunity assessment",
        body: "Every candidate workflow scored on value, feasibility, and risk — with numbers attached.",
      },
      {
        title: "Build vs. buy analysis",
        body: "Honest total-cost comparison, including the vendor lock-in nobody quotes.",
      },
      {
        title: "Governance and risk",
        body: "Data handling, model policy, review gates, and audit expectations documented.",
      },
      {
        title: "Team capability plan",
        body: "What to hire, what to train, and what to partner on for the next 12 months.",
      },
    ],
    deliverables: [
      "Scored opportunity portfolio",
      "Costed 12-month roadmap",
      "Governance and risk framework",
      "Executive readout and board-ready narrative",
    ],
    stack: ["Workshops", "Data audit", "Cost modeling", "Architecture review"],
    engagement: "Fixed fee, 3–5 weeks, roadmap credited against a build engagement.",
    faqs: [
      {
        q: "Will you recommend yourselves for the build?",
        a: "Only where we're the right team. Several roadmaps we've written were executed in-house by the client.",
      },
      {
        q: "Who needs to be involved?",
        a: "An executive sponsor, the operators who do the work, and someone who owns the data.",
      },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
