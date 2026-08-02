export type Solution = {
  slug: string;
  department: string;
  headline: string;
  summary: string;
  problems: string[];
  plays: { title: string; body: string; impact: string }[];
  metrics: { value: string; label: string }[];
  integrations: string[];
};

export const solutions: Solution[] = [
  {
    slug: "sales",
    department: "Sales",
    headline: "Sell more without adding headcount.",
    summary:
      "Reps spend a third of their week on research, notes, and CRM upkeep. We move that work to systems and give the hours back to selling.",
    problems: [
      "Research and list-building eats prospecting time",
      "CRM data is stale, so forecasts are guesswork",
      "Follow-up depends on whoever remembers",
      "Proposals and quotes are rebuilt from scratch every time",
    ],
    plays: [
      {
        title: "Signal-driven prospecting",
        body: "Accounts surface themselves based on hiring, funding, tech, and product usage signals — scored and routed automatically.",
        impact: "3.1x qualified meetings",
      },
      {
        title: "Zero-entry CRM",
        body: "Calls transcribed, deals updated, next steps drafted, fields enriched. Reps confirm rather than type.",
        impact: "5 hrs/week per rep",
      },
      {
        title: "Follow-up that never drops",
        body: "Every commitment becomes a tracked task with drafted content and an SLA the manager can see.",
        impact: "+18% stage conversion",
      },
      {
        title: "Instant proposals",
        body: "Quote, scope, and contract generated from deal data with approval routing built in.",
        impact: "Days to minutes",
      },
    ],
    metrics: [
      { value: "+23%", label: "forecast accuracy" },
      { value: "-31%", label: "sales cycle length" },
      { value: "5 hrs", label: "returned per rep weekly" },
    ],
    integrations: ["HubSpot", "Salesforce", "Gong", "Clay", "Slack", "DocuSign"],
  },
  {
    slug: "marketing",
    department: "Marketing",
    headline: "A content and campaign engine that compounds.",
    summary:
      "Production capacity, not ideas, is the constraint. We automate the assembly line and keep your voice in control of the output.",
    problems: [
      "Content velocity is capped by manual production",
      "Campaign reporting is stitched together by hand",
      "Personalization stops at first name",
      "Briefs and approvals stall in inboxes",
    ],
    plays: [
      {
        title: "Research-to-brief pipeline",
        body: "SERP, customer-call, and support-ticket mining produces briefs grounded in what buyers actually ask.",
        impact: "4x brief throughput",
      },
      {
        title: "Governed content production",
        body: "Drafting inside your brand rules with structured review gates and a human editor as the final word.",
        impact: "-58% cost per asset",
      },
      {
        title: "Segment-level personalization",
        body: "Page, email, and ad variants generated per segment and tested continuously.",
        impact: "+34% landing conversion",
      },
      {
        title: "Always-on reporting",
        body: "Warehouse-backed campaign performance with channel attribution refreshed hourly.",
        impact: "Zero manual reporting",
      },
    ],
    metrics: [
      { value: "4x", label: "content throughput" },
      { value: "-58%", label: "cost per published asset" },
      { value: "+34%", label: "conversion on tested pages" },
    ],
    integrations: ["Webflow", "HubSpot", "Ahrefs", "PostHog", "Notion", "Figma"],
  },
  {
    slug: "hr",
    department: "HR & People",
    headline: "Hire and onboard without the administrative drag.",
    summary:
      "Screening, scheduling, and onboarding are high-volume and rule-driven. Perfect candidates for automation with a human in the loop.",
    problems: [
      "Screening hundreds of applicants by hand",
      "Scheduling ping-pong across panels",
      "Onboarding checklists live in someone's head",
      "Policy questions interrupt the people team daily",
    ],
    plays: [
      {
        title: "Structured screening",
        body: "Applications scored against calibrated rubrics with reasoning attached and bias checks logged.",
        impact: "-72% screening hours",
      },
      {
        title: "Autonomous scheduling",
        body: "Panels assembled and booked across calendars with rescheduling handled automatically.",
        impact: "9 days faster to offer",
      },
      {
        title: "Onboarding orchestration",
        body: "Accounts, hardware, training, and check-ins triggered from the offer signature.",
        impact: "Day-one readiness 100%",
      },
      {
        title: "Policy assistant",
        body: "An assistant grounded in your handbook and regional policies, with citations and escalation.",
        impact: "-64% inbound questions",
      },
    ],
    metrics: [
      { value: "-72%", label: "screening hours" },
      { value: "9 days", label: "faster time to offer" },
      { value: "-64%", label: "internal HR tickets" },
    ],
    integrations: ["Greenhouse", "Rippling", "BambooHR", "Google Workspace", "Slack", "Okta"],
  },
  {
    slug: "finance",
    department: "Finance",
    headline: "Close the books while the month is still relevant.",
    summary:
      "Reconciliation, approvals, and reporting are deterministic work trapped in spreadsheets. We make them continuous.",
    problems: [
      "Close takes two weeks of manual reconciliation",
      "Invoice and expense coding by hand",
      "Approvals chased over email",
      "Board reporting rebuilt every quarter",
    ],
    plays: [
      {
        title: "Continuous reconciliation",
        body: "Bank, billing, and ledger matched daily with exceptions queued rather than discovered at close.",
        impact: "Close in 3 days",
      },
      {
        title: "Document intelligence",
        body: "Invoices, receipts, and contracts extracted, coded, and validated against policy before posting.",
        impact: "97% straight-through",
      },
      {
        title: "Approval workflow",
        body: "Threshold-based routing with full audit trail and automatic reminders.",
        impact: "-80% approval latency",
      },
      {
        title: "Reporting layer",
        body: "Warehouse-backed board pack that regenerates itself with commentary drafted from variances.",
        impact: "Hours, not weeks",
      },
    ],
    metrics: [
      { value: "3 days", label: "month-end close" },
      { value: "97%", label: "invoices straight-through" },
      { value: "100%", label: "auditable approval trail" },
    ],
    integrations: ["NetSuite", "QuickBooks", "Stripe", "Ramp", "Snowflake", "Looker"],
  },
  {
    slug: "knowledge-management",
    department: "Knowledge Management",
    headline: "One answer layer across every source of truth.",
    summary:
      "Your company already knows the answer. It's spread across six tools and four people. We build the retrieval layer that surfaces it with provenance.",
    problems: [
      "Answers live in Slack threads nobody can find",
      "Documentation drifts from reality",
      "New hires ramp by interrupting seniors",
      "Access rules make search unsafe to open up",
    ],
    plays: [
      {
        title: "Unified retrieval",
        body: "Incremental indexing across docs, tickets, code, and chat with permission inheritance preserved.",
        impact: "Sub-second answers",
      },
      {
        title: "Provenance on every answer",
        body: "Citations to source, author, and last-updated date so trust is verifiable.",
        impact: "Zero blind answers",
      },
      {
        title: "Drift detection",
        body: "Stale and contradictory content flagged for owners automatically.",
        impact: "-45% stale docs",
      },
      {
        title: "Ramp assistant",
        body: "Role-scoped onboarding assistant that answers in context and escalates gaps.",
        impact: "-38% ramp time",
      },
    ],
    metrics: [
      { value: "-38%", label: "new-hire ramp time" },
      { value: "6", label: "systems unified" },
      { value: "100%", label: "permission-aware results" },
    ],
    integrations: ["Notion", "Confluence", "Google Drive", "Slack", "Zendesk", "GitHub"],
  },
  {
    slug: "custom-ai-assistants",
    department: "Custom AI Assistants",
    headline: "Assistants that know your business, not the internet's.",
    summary:
      "Domain assistants grounded in your data, constrained by your rules, and measured against your standards.",
    problems: [
      "Generic chatbots don't know your policies",
      "Sensitive data can't leave your boundary",
      "No way to evaluate answer quality",
      "Nobody owns the assistant after launch",
    ],
    plays: [
      {
        title: "Grounded domain knowledge",
        body: "Retrieval scoped to approved sources with strict refusal behavior outside its remit.",
        impact: "94% answer accuracy",
      },
      {
        title: "Deployment where work happens",
        body: "Slack, Teams, your product, or a support widget — one core, many surfaces.",
        impact: "3x adoption",
      },
      {
        title: "Evaluation and tuning loop",
        body: "Real conversations sampled, scored, and fed back into the eval set weekly.",
        impact: "Measurable quality",
      },
      {
        title: "Cost and safety controls",
        body: "Per-team budgets, PII redaction, and full transcript retention policy.",
        impact: "Predictable spend",
      },
    ],
    metrics: [
      { value: "94%", label: "evaluated answer accuracy" },
      { value: "78%", label: "queries resolved autonomously" },
      { value: "$0.03", label: "median cost per resolution" },
    ],
    integrations: ["Slack", "Microsoft Teams", "Zendesk", "Intercom", "pgvector", "Anthropic"],
  },
];

export const getSolution = (slug: string) => solutions.find((s) => s.slug === slug);
