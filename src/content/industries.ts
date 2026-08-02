export type Industry = {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  pressures: string[];
  workloads: { title: string; body: string }[];
  compliance: string[];
  proof: { value: string; label: string }[];
};

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    headline: "Automation that respects the chart and the regulator.",
    summary:
      "Care operations run on documentation, eligibility, and coordination. We automate the paperwork without touching clinical judgment.",
    pressures: [
      "Administrative load drives clinician burnout",
      "Prior authorization cycles delay care",
      "Eligibility and coding errors leak revenue",
      "Every workflow must be auditable",
    ],
    workloads: [
      { title: "Intake and eligibility", body: "Verification, coverage checks, and record requests handled before the visit." },
      { title: "Prior authorization", body: "Packet assembly, submission, and status chasing with clinician review gates." },
      { title: "Revenue cycle", body: "Coding validation, denial classification, and appeal drafting." },
      { title: "Care coordination", body: "Referral tracking and follow-up outreach with escalation to staff." },
    ],
    compliance: ["HIPAA-aligned architecture", "BAAs with all subprocessors", "PHI redaction in transit", "Full audit logging"],
    proof: [
      { value: "-64%", label: "prior-auth turnaround" },
      { value: "2,400", label: "admin hours saved yearly" },
      { value: "+11%", label: "clean-claim rate" },
    ],
  },
  {
    slug: "finance",
    name: "Financial Services",
    headline: "Auditable automation for teams that get examined.",
    summary:
      "Regulated work rewards determinism. We keep decisions explicit and evidence complete while removing the manual burden.",
    pressures: [
      "KYC and onboarding backlogs",
      "Manual reconciliation across custodians",
      "Reporting demands with zero tolerance for error",
      "Model risk governance requirements",
    ],
    workloads: [
      { title: "Client onboarding", body: "Document collection, KYC checks, and risk scoring with reviewer sign-off." },
      { title: "Reconciliation", body: "Daily multi-source matching with exception queues and aging." },
      { title: "Surveillance support", body: "Communication review triage that ranks by risk, not by date." },
      { title: "Reporting automation", body: "Regulatory and client reporting generated from a governed warehouse." },
    ],
    compliance: ["SOC 2 aligned controls", "Immutable audit trail", "Model documentation pack", "Segregated environments"],
    proof: [
      { value: "-58%", label: "onboarding cycle time" },
      { value: "3 days", label: "month-end close" },
      { value: "100%", label: "decisions traceable" },
    ],
  },
  {
    slug: "saas",
    name: "SaaS",
    headline: "Engineer the lifecycle, not just the product.",
    summary:
      "Activation, expansion, and retention are systems problems. We instrument them and automate the interventions that move them.",
    pressures: [
      "Activation drops before value is felt",
      "Support volume scales with revenue",
      "Expansion signals go unnoticed",
      "Churn is diagnosed after it happens",
    ],
    workloads: [
      { title: "Activation engineering", body: "Onboarding instrumentation with targeted in-product and outbound nudges." },
      { title: "Support automation", body: "Tier-1 resolution with product-aware retrieval and clean escalation." },
      { title: "Expansion signals", body: "Usage-based playbooks routed to the right owner at the right moment." },
      { title: "Churn prediction", body: "Leading-indicator models with a defined intervention for each risk tier." },
    ],
    compliance: ["Tenant isolation review", "SSO and SCIM readiness", "Data residency options", "Subprocessor register"],
    proof: [
      { value: "+3.4pt", label: "trial-to-paid conversion" },
      { value: "78%", label: "tickets auto-resolved" },
      { value: "-22%", label: "logo churn" },
    ],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    headline: "Intelligence across supply, quality, and maintenance.",
    summary:
      "Plant data is abundant and unused. We connect it and act on it, from purchase order to preventive maintenance.",
    pressures: [
      "Supplier communication trapped in email",
      "Quality issues found late and expensively",
      "Unplanned downtime dominates cost",
      "Documentation burden on every change",
    ],
    workloads: [
      { title: "Supplier operations", body: "Quote comparison, PO matching, and delivery exception handling." },
      { title: "Quality intelligence", body: "Inspection data classified with defect trend alerts to engineering." },
      { title: "Maintenance planning", body: "Condition signals converted into scheduled work orders." },
      { title: "Documentation automation", body: "Work instructions and change records generated from source data." },
    ],
    compliance: ["ISO 9001 documentation support", "Traceability by lot and serial", "On-prem or VPC deployment", "Change control logging"],
    proof: [
      { value: "-37%", label: "unplanned downtime" },
      { value: "-19%", label: "scrap rate" },
      { value: "1,600", label: "hours saved in procurement" },
    ],
  },
  {
    slug: "retail",
    name: "Retail & eCommerce",
    headline: "Merchandising and service that keep up with demand.",
    summary:
      "Catalog, pricing, and support scale non-linearly. Automation is the only way to hold margin while growing SKUs.",
    pressures: [
      "Catalog enrichment can't keep pace",
      "Pricing decisions made on stale data",
      "Support spikes every promotion",
      "Returns eat margin invisibly",
    ],
    workloads: [
      { title: "Catalog operations", body: "Attribute extraction, copy generation, and image QA at SKU scale." },
      { title: "Pricing intelligence", body: "Competitor and elasticity signals surfaced with guardrailed recommendations." },
      { title: "Service automation", body: "Order status, returns, and WISMO resolved without an agent." },
      { title: "Returns analysis", body: "Reason classification feeding merchandising and supplier scorecards." },
    ],
    compliance: ["PCI-conscious architecture", "PII minimization", "Consent-aware messaging", "Marketplace policy adherence"],
    proof: [
      { value: "12k", label: "SKUs enriched per week" },
      { value: "-41%", label: "support cost per order" },
      { value: "+2.7%", label: "gross margin" },
    ],
  },
  {
    slug: "logistics",
    name: "Logistics",
    headline: "Exception handling across the whole chain.",
    summary:
      "Logistics is the management of exceptions. We detect them earlier and resolve most of them without a phone call.",
    pressures: [
      "Status updates gathered by phone and email",
      "Documentation errors cause customs delays",
      "Carrier performance is anecdotal",
      "Claims processing is slow and manual",
    ],
    workloads: [
      { title: "Shipment visibility", body: "Multi-carrier status normalized with proactive delay alerts." },
      { title: "Document processing", body: "BOL, invoice, and customs paperwork extracted and validated." },
      { title: "Carrier scorecards", body: "Performance and cost analytics that inform the next tender." },
      { title: "Claims automation", body: "Evidence assembly and submission with status tracking." },
    ],
    compliance: ["Customs documentation accuracy controls", "Data retention policy", "Partner access scoping", "Audit-ready event log"],
    proof: [
      { value: "-52%", label: "status-check calls" },
      { value: "-29%", label: "customs holds" },
      { value: "4.2x", label: "claims processed per FTE" },
    ],
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
