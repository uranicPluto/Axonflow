export const processStages = [
  {
    number: "01",
    name: "Diagnostic",
    duration: "Week 1–2",
    promise: "We measure before we recommend.",
    detail:
      "We shadow the people doing the work, instrument the current process, and put a number on every handoff. You get a baseline you can hold us to.",
    outputs: ["Process map with hour and cost baselines", "Opportunity portfolio, scored", "Data and access audit"],
  },
  {
    number: "02",
    name: "Architecture",
    duration: "Week 2–4",
    promise: "Decide once, in writing.",
    detail:
      "Target-state design, build-versus-buy calls, and the boring decisions — data ownership, failure modes, review gates — documented before code.",
    outputs: ["Target architecture", "Architecture decision records", "Costed delivery plan"],
  },
  {
    number: "03",
    name: "Foundation",
    duration: "Week 4–7",
    promise: "The unglamorous layer, done properly.",
    detail:
      "Integrations, data contracts, observability, and the evaluation harness. Everything after this moves faster because of it.",
    outputs: ["Integration layer with contract tests", "Observability and cost monitoring", "Evaluation harness"],
  },
  {
    number: "04",
    name: "Build",
    duration: "Week 6–12",
    promise: "Working software every week.",
    detail:
      "Weekly demos against real data. Deterministic logic stays explicit; models are used where variance is expected and always evaluated.",
    outputs: ["Production workflows and surfaces", "Regression suite in CI", "Weekly demo record"],
  },
  {
    number: "05",
    name: "Shadow & cutover",
    duration: "Week 10–14",
    promise: "Prove it in parallel first.",
    detail:
      "The new system runs alongside the old one until accuracy and cost clear the agreed thresholds. Then we cut over by segment, never all at once.",
    outputs: ["Shadow-mode accuracy report", "Phased cutover plan", "Rollback procedure"],
  },
  {
    number: "06",
    name: "Ownership",
    duration: "Week 14+",
    promise: "You own it, or we run it. Your call.",
    detail:
      "Documentation, runbooks, and enablement so your team can extend the system. Optional operating retainer for tuning and on-call.",
    outputs: ["Runbooks and documentation", "Team enablement sessions", "Optional operating retainer"],
  },
];

export const principles = [
  {
    title: "Measure first, automate second",
    body: "If we can't baseline it, we won't claim to have improved it. Every engagement starts with numbers.",
  },
  {
    title: "Deterministic where it counts",
    body: "Business rules belong in code that can be tested. Models handle language and variance, not policy.",
  },
  {
    title: "Autonomy is earned",
    body: "Systems start supervised and graduate as evaluations prove them. No automation ships on faith.",
  },
  {
    title: "You own the outcome and the code",
    body: "Your repository, your cloud, your data. No black boxes, no hostage architecture.",
  },
];

export const team = [
  {
    name: "Ilya Marchetti",
    role: "Founder & Principal Architect",
    bio: "Fifteen years building production systems, previously staff engineer on platform infrastructure at two scaled marketplaces.",
    initials: "IM",
  },
  {
    name: "Sana Qureshi",
    role: "Head of Applied AI",
    bio: "Led evaluation and safety tooling for enterprise LLM deployments. Publishes on retrieval quality and agent auditability.",
    initials: "SQ",
  },
  {
    name: "David Okonkwo",
    role: "Head of Delivery",
    bio: "Ran operations transformation for a 4,000-person logistics business before moving to the build side.",
    initials: "DO",
  },
  {
    name: "Marta Lindqvist",
    role: "Principal, GTM Engineering",
    bio: "Built revenue infrastructure at three B2B software companies from Series A to IPO readiness.",
    initials: "ML",
  },
];

export const companyFacts = [
  { value: "2019", label: "Founded" },
  { value: "68", label: "Systems in production" },
  { value: "412k", label: "Hours returned to clients" },
  { value: "94%", label: "Clients who extend scope" },
];
