export type Insight = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  body: { heading?: string; paragraphs: string[] }[];
};

export const insights: Insight[] = [
  {
    slug: "automation-roi-is-a-measurement-problem",
    title: "Automation ROI is a measurement problem, not a technology problem",
    category: "Operations",
    date: "2026-07-14",
    readTime: "7 min",
    author: "Ilya Marchetti",
    excerpt:
      "Most automation projects fail their business case in the spreadsheet, not the codebase. If you cannot baseline the process, you cannot defend the investment.",
    body: [
      {
        paragraphs: [
          "We have reviewed roughly ninety automation business cases in the last four years. The technology worked in most of them. The business case survived in fewer than half. The difference was almost never model quality — it was whether anyone had measured the process before changing it.",
          "A baseline is not a guess about how long something takes. It is an instrumented number, collected over enough cycles to include the bad weeks, attributed to named steps in a real workflow.",
        ],
      },
      {
        heading: "What a defensible baseline contains",
        paragraphs: [
          "Volume per period, including seasonality. Time per unit, separated by happy path and exception. Fully loaded cost per hour for the people involved. Error rate and the cost of each error class. Rework volume, which is almost always underestimated.",
          "The last one matters most. Teams measure the time to do the work and forget the time spent doing it a second time. In our engagements, rework accounts for a median 19% of total process hours.",
        ],
      },
      {
        heading: "The exception tax",
        paragraphs: [
          "The happy path is cheap to automate and cheap to measure. Exceptions consume the majority of human time and the majority of build effort. If your business case assumes the exception rate you see in the documentation rather than the one in the data, it will be wrong by a factor rather than a margin.",
          "Design for exceptions from the start: route them to people with full context, and count them as a first-class outcome rather than a failure.",
        ],
      },
      {
        heading: "Instrument the new system with the old metrics",
        paragraphs: [
          "The most common reporting mistake is measuring the new system with new metrics. Automation rate and token cost are operational metrics, not business metrics. Keep reporting hours, cost per unit, cycle time, and error rate — the same four numbers you baselined — and the argument for the next project writes itself.",
        ],
      },
    ],
  },
  {
    slug: "agents-need-permissions-not-personalities",
    title: "Agents need permissions, not personalities",
    category: "AI Engineering",
    date: "2026-06-28",
    readTime: "9 min",
    author: "Sana Qureshi",
    excerpt:
      "The hard part of shipping agents to production is not reasoning quality. It is the permission model, the audit trail, and knowing when to stop.",
    body: [
      {
        paragraphs: [
          "Every agent demo looks the same and works the same. Every agent in production differs on the same three axes: what it is allowed to touch, what evidence it leaves behind, and what it does when it is unsure.",
        ],
      },
      {
        heading: "Capabilities are an allowlist",
        paragraphs: [
          "Give an agent a typed tool per capability, each with scoped credentials, rate limits, and an explicit reversibility classification. Reversible actions can run autonomously. Irreversible ones — refunds, deletions, external communication at scale — require approval until evaluation data earns them autonomy.",
          "This is not a limitation on capability. It is the mechanism by which capability expands safely.",
        ],
      },
      {
        heading: "Audit trails are the product",
        paragraphs: [
          "When a stakeholder asks why the system did something in March, the answer must be retrievable in seconds. That means persisting the inputs, the retrieved context with source references, the tool calls with arguments and results, and the decision at every gate.",
          "Teams that treat this as observability overhead ship slower, because every incident becomes an investigation instead of a lookup.",
        ],
      },
      {
        heading: "Evaluation is a CI gate, not a launch checklist",
        paragraphs: [
          "Build a golden set from real cases, including the ones that went badly. Run it on every prompt, model, or retrieval change, in CI, with a threshold that blocks merge. Sample production conversations weekly and promote the interesting failures into the set.",
          "Without this loop, a model upgrade is a coin flip. With it, it is a pull request.",
        ],
      },
      {
        heading: "Knowing when to stop",
        paragraphs: [
          "Confidence-based escalation is the highest-leverage feature in an agent system. An agent that hands off cleanly with full context is more valuable than one that resolves five percent more cases and occasionally invents an answer. Users forgive handoffs. They do not forgive confident errors.",
        ],
      },
    ],
  },
  {
    slug: "the-crm-adoption-problem-is-a-typing-problem",
    title: "The CRM adoption problem is a typing problem",
    category: "Revenue",
    date: "2026-06-09",
    readTime: "6 min",
    author: "Marta Lindqvist",
    excerpt:
      "Reps are not lazy and they are not resisting change. They are declining to do forty minutes of data entry a day for someone else's dashboard.",
    body: [
      {
        paragraphs: [
          "Every CRM rescue project we have run began with a leadership hypothesis about discipline and ended with a finding about friction. When we instrument the actual cost of logging a call properly, it is between four and nine minutes. Multiply by the daily call volume and the behavior stops being mysterious.",
        ],
      },
      {
        heading: "Stop asking for data you can capture",
        paragraphs: [
          "Firmographics come from enrichment. Activity comes from calendar and email. Call content comes from transcription. Next steps can be drafted from the transcript and confirmed with one click. Almost every field a rep types today can be captured from a system that already has it.",
          "Reserve human input for genuine judgment: qualification, risk, and the political read on the account. Those are worth typing.",
        ],
      },
      {
        heading: "Design stages a manager can inspect",
        paragraphs: [
          "Most pipelines encode a sales methodology nobody follows. Rebuild stages around observable buyer behavior with explicit exit criteria. If a stage cannot be verified from evidence in the record, it will be reported optimistically forever.",
        ],
      },
      {
        heading: "Forecast accuracy follows",
        paragraphs: [
          "Across our CRM engagements, field completeness reached 94% without any change to rep incentives, and forecast accuracy improved by a median 23% within two quarters. Nothing changed about the people. The work changed.",
        ],
      },
    ],
  },
  {
    slug: "build-versus-buy-in-the-ai-era",
    title: "Build versus buy, honestly, in the AI era",
    category: "Strategy",
    date: "2026-05-21",
    readTime: "8 min",
    author: "Ilya Marchetti",
    excerpt:
      "A framework for deciding when to buy the tool, when to build the system, and when to do nothing at all — including the total costs vendors never quote.",
    body: [
      {
        paragraphs: [
          "We are a build shop, so treat the following with appropriate suspicion. We also tell perhaps a quarter of the companies who approach us to buy something instead, because that is what makes the other three-quarters worth the money.",
        ],
      },
      {
        heading: "Buy when the workflow is common and non-differentiating",
        paragraphs: [
          "Transcription, scheduling, e-signature, expense capture, standard support macros. These are solved, competitively priced, and improving faster than you would. Buying is correct and building is vanity.",
        ],
      },
      {
        heading: "Build when the workflow is how you compete",
        paragraphs: [
          "If the process encodes something specific about how your business wins — pricing logic, underwriting judgment, clinical routing, supply allocation — a generic tool will force you toward the industry average. That is the actual cost of buying, and it never appears in the comparison.",
        ],
      },
      {
        heading: "The costs nobody quotes",
        paragraphs: [
          "Per-seat pricing that grows with headcount. Integration work that is your problem regardless. The migration cost when the vendor changes direction. The workaround spreadsheet your team maintains because the tool does not quite fit — that spreadsheet is a real line item.",
          "Model those four and the comparison changes shape more often than people expect.",
        ],
      },
      {
        heading: "Do nothing when the process should be deleted",
        paragraphs: [
          "The best outcome of a diagnostic is occasionally the discovery that a workflow exists to produce a report nobody reads. Automating it would have been a well-engineered waste. Ask what the output is for before asking how to speed it up.",
        ],
      },
    ],
  },
  {
    slug: "shadow-mode-is-the-only-safe-cutover",
    title: "Shadow mode is the only safe cutover",
    category: "Delivery",
    date: "2026-04-30",
    readTime: "5 min",
    author: "David Okonkwo",
    excerpt:
      "Running the new system in parallel costs a few weeks and eliminates the category of failure that kills automation programs.",
    body: [
      {
        paragraphs: [
          "Automation programs rarely die from bad code. They die from one visible failure in the first month that costs leadership its confidence. Shadow mode is how you spend three weeks to prevent that.",
        ],
      },
      {
        heading: "What shadow mode means precisely",
        paragraphs: [
          "The new system processes every real case and records what it would have done. Humans continue doing the work. Nightly, you compare outputs and classify every divergence: system correct, human correct, or ambiguous.",
          "The third bucket is the valuable one. Ambiguity almost always reveals an undocumented rule.",
        ],
      },
      {
        heading: "Set the threshold before you look at the data",
        paragraphs: [
          "Agree the accuracy and cost thresholds for cutover in writing, in advance, with the business owner. Deciding afterwards turns an engineering judgment into a negotiation.",
        ],
      },
      {
        heading: "Cut over by segment",
        paragraphs: [
          "Then move one segment, category, or region at a time, with a rollback procedure documented and tested. Every engagement we have run this way has held its rollout schedule. The ones that skipped it are the ones we cite in this article.",
        ],
      },
    ],
  },
];

export const getInsight = (slug: string) => insights.find((i) => i.slug === slug);
