export const testimonials = [
  {
    text: "They mapped our entire ops in week one and automated 70% within a month. The efficiency gains are incredible.",
    name: "Briana Patton",
    role: "Operations Manager",
    company: "B2B SaaS Company",
    initials: "BP",
  },
  {
    text: "Reporting went from 12 hours to 20 minutes. Every client gets it Monday before we log in.",
    name: "Bilal Ahmed",
    role: "IT Manager",
    company: "Marketing Agency",
    initials: "BA",
  },
  {
    text: "Lead response went from hours to under a minute. Site visits up 3x in 6 weeks. Exceptional support.",
    name: "Saman Malik",
    role: "Customer Support Lead",
    company: "Real Estate Agency",
    initials: "SM",
  },
  {
    text: "This automation pipeline revolutionized our operations, streamlining finance reconciliation and customer onboarding.",
    name: "Omar Raza",
    role: "CEO",
    company: "FinScale",
    initials: "OR",
  },
  {
    text: "The transition was extremely smooth and fast. Custom software integration made team onboarding simple.",
    name: "Zainab Hussain",
    role: "Project Manager",
    company: "Bright Media",
    initials: "ZH",
  },
  {
    text: "The support team is exceptional, guiding us through setup and providing ongoing assistance when scaling pipelines.",
    name: "Aliza Khan",
    role: "Business Analyst",
    company: "Logistics Pro",
    initials: "AK",
  },
  {
    text: "Using custom AI agents, our customer booking conversions significantly improved, boosting business performance.",
    name: "Farhan Siddiqui",
    role: "Marketing Director",
    company: "Growth Labs",
    initials: "FS",
  },
  {
    text: "They delivered a custom sync workflow that exceeded expectations, understanding our needs and enhancing operations.",
    name: "Sana Sheikh",
    role: "Sales Manager",
    company: "Elite Properties",
    initials: "SS",
  },
  {
    text: "HubSpot and Stripe syncing works flawlessly now. Not a single manual invoice error since launch.",
    name: "Hassan Ali",
    role: "E-commerce Manager",
    company: "Retail Brands",
    initials: "HA",
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
    {
      label: "Year-one cost",
      a: "$318,000 fully loaded",
      b: "$140,000 build + $24,000/yr run",
      highlight: true,
    },
    { label: "Time to full capacity", a: "4–6 months incl. ramp", b: "6–12 weeks to production" },
    {
      label: "Capacity ceiling",
      a: "Linear — more volume needs more people",
      b: "Elastic — volume scales at marginal cost",
      highlight: true,
    },
    {
      label: "Consistency",
      a: "Varies by person and by day",
      b: "Evaluated continuously against a golden set",
    },
    {
      label: "Audit trail",
      a: "Reconstructed after the fact",
      b: "Complete by default, every action logged",
    },
    {
      label: "Knowledge retention",
      a: "Leaves with the employee",
      b: "Encoded in versioned rules and tests",
    },
    {
      label: "Judgment on edge cases",
      a: "Strong — humans excel here",
      b: "Escalated to your team by design",
    },
  ],
  footnote:
    "Automation is not a substitute for good people. It is a substitute for good people doing work beneath them.",
};

export const comparisonPartner = {
  title: "Off-the-shelf AI tool vs. a custom AI partner",
  subtitle: "Where each option genuinely wins.",
  columns: ["Off-the-shelf platform", "Axonflow engagement"],
  rows: [
    {
      label: "Fits your process",
      a: "You adapt to the product's model",
      b: "Built around how your business actually runs",
      highlight: true,
    },
    {
      label: "Time to first value",
      a: "Days for generic use cases",
      b: "Weeks for your specific workflow",
    },
    {
      label: "Integration depth",
      a: "Whatever the connector library supports",
      b: "Anything with an API, contract-tested",
      highlight: true,
    },
    { label: "Data boundary", a: "Vendor-defined", b: "Your cloud, your retention policy" },
    {
      label: "Cost trajectory",
      a: "Per-seat, grows with the team",
      b: "Build once, marginal run cost",
    },
    { label: "Ownership", a: "You rent the capability", b: "You own the code and the outcome" },
    {
      label: "Best when",
      a: "The use case is common and non-differentiating",
      b: "The workflow is core to how you compete",
    },
  ],
  footnote: "We will tell you when a $200/month tool is the right answer. It sometimes is.",
};

export const homeFaqs = [
  {
    q: "How quickly do you start?",
    a: "Discovery begins within one week of a signed engagement. First production workflows are live within 4–6 weeks after that.",
  },
  {
    q: "What does an engagement cost?",
    a: "Website projects start from ₹12,000. Automation builds from ₹15,000 one-time with maintenance from ₹2,000/month. Bundles start from ₹22,000. We scope every project before quoting — no guesswork.",
  },
  {
    q: "Do you work with our engineers?",
    a: "Yes. We build on your existing stack, document everything, and hand over systems your engineers can maintain. We are not a black box.",
  },
  {
    q: "What if the automation gets it wrong?",
    a: "Confidence thresholds route uncertain cases to humans, every run is logged and replayable, and regressions are caught by an evaluation suite in CI.",
  },
  {
    q: "Which industries do you work in?",
    a: "We actively work in 14 industries: Technology and SaaS, Healthcare, Finance and Accounting, Banking, Logistics, Manufacturing, Retail and D2C, Marketing, Real Estate, Education and EdTech, HR and Recruitment, Media and Publishing, Hospitality, and Agency Operations.",
  },
];
