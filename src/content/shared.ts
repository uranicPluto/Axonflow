export const testimonials = [
  {
    text: "They asked harder questions in week one than our last two vendors asked in a year. The roadmap they produced is still the document we plan against.",
    name: "Marcus Feld",
    role: "Chief Revenue Officer",
    company: "Northwind",
    initials: "MF",
  },
  {
    text: "What separated Axonflow was the refusal to ship anything they couldn't measure. Every claim in the proposal had a number behind it by month three.",
    name: "Priya Raman",
    role: "VP Finance",
    company: "Ledgerline",
    initials: "PR",
  },
  {
    text: "The number that mattered was not the automation rate. It was that our coordinators stopped working evenings.",
    name: "Dr. Naomi Okafor",
    role: "Chief Medical Officer",
    company: "Cadence Health",
    initials: "NO",
  },
];

export const heroMetrics = [
  { value: "40%", label: "Average reduction in operational overhead after automation" },
  { value: "3x", label: "Faster lead and customer response with automated pipelines" },
  { value: "4 wks", label: "From discovery call to first live automation in production" },
];

export const integrationGroups = [
  {
    group: "Data & Warehouse",
    items: ["Snowflake", "BigQuery", "Postgres", "dbt", "Airbyte", "Fivetran"],
  },
  {
    group: "Revenue",
    items: ["Salesforce", "HubSpot", "Clay", "Gong", "Apollo", "Stripe"],
  },
  {
    group: "Models & AI",
    items: ["OpenAI", "Anthropic", "Azure OpenAI", "pgvector", "LangGraph", "Replicate"],
  },
  {
    group: "Operations",
    items: ["Slack", "Notion", "Linear", "Zendesk", "Temporal", "Google Workspace"],
  },
  {
    group: "Systems of Record",
    items: ["NetSuite", "SAP", "Epic FHIR", "Rippling", "Greenhouse", "Shopify"],
  },
];

export const comparisonHiring = {
  title: "Hiring headcount vs. engineered automation",
  subtitle: "Modeled on a five-person operations function handling 4,000 monthly tasks.",
  columns: ["Adding three operators", "Engineered automation"],
  rows: [
    { label: "Year-one cost", a: "$318,000 fully loaded", b: "$140,000 build + $24,000/yr run", highlight: true },
    { label: "Time to full capacity", a: "4–6 months incl. ramp", b: "6–12 weeks to production" },
    { label: "Capacity ceiling", a: "Linear — more volume needs more people", b: "Elastic — volume scales at marginal cost", highlight: true },
    { label: "Consistency", a: "Varies by person and by day", b: "Evaluated continuously against a golden set" },
    { label: "Audit trail", a: "Reconstructed after the fact", b: "Complete by default, every action logged" },
    { label: "Knowledge retention", a: "Leaves with the employee", b: "Encoded in versioned rules and tests" },
    { label: "Judgment on edge cases", a: "Strong — humans excel here", b: "Escalated to your team by design" },
  ],
  footnote:
    "Automation is not a substitute for good people. It is a substitute for good people doing work beneath them.",
};

export const comparisonPartner = {
  title: "Off-the-shelf AI tool vs. a custom AI partner",
  subtitle: "Where each option genuinely wins.",
  columns: ["Off-the-shelf platform", "Axonflow engagement"],
  rows: [
    { label: "Fits your process", a: "You adapt to the product's model", b: "Built around how your business actually runs", highlight: true },
    { label: "Time to first value", a: "Days for generic use cases", b: "Weeks for your specific workflow" },
    { label: "Integration depth", a: "Whatever the connector library supports", b: "Anything with an API, contract-tested", highlight: true },
    { label: "Data boundary", a: "Vendor-defined", b: "Your cloud, your retention policy" },
    { label: "Cost trajectory", a: "Per-seat, grows with the team", b: "Build once, marginal run cost" },
    { label: "Ownership", a: "You rent the capability", b: "You own the code and the outcome" },
    { label: "Best when", a: "The use case is common and non-differentiating", b: "The workflow is core to how you compete" },
  ],
  footnote: "We will tell you when a $200/month tool is the right answer. It sometimes is.",
};

export const homeFaqs = [
  {
    q: "How quickly do you start?",
    a: "Discovery typically begins within two weeks of a signed engagement. First production workflows land six to twelve weeks after that.",
  },
  {
    q: "What does an engagement cost?",
    a: "Diagnostics run $18k–$35k. Build engagements typically fall between $60k and $280k depending on scope, with fixed-price phases wherever the scope allows.",
  },
  {
    q: "Do you work with our engineers?",
    a: "Preferably. Embedded delivery with your engineers pairing is how ownership transfers properly.",
  },
  {
    q: "What if the automation gets it wrong?",
    a: "Confidence thresholds route uncertain cases to humans, every run is logged and replayable, and regressions are caught by an evaluation suite in CI.",
  },
  {
    q: "Where does our data go?",
    a: "Into your cloud account, under your retention policy. Where models are involved, we redact and use enterprise endpoints with no training on your data.",
  },
];
