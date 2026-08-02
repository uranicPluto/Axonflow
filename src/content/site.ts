export const brand = {
  name: "Axonflow",
  legalName: "Axonflow Labs, Inc.",
  tagline: "Automation and growth engineering for companies that intend to win.",
  positioning:
    "We architect the AI systems that run your business — so revenue compounds while manual work disappears.",
  email: "hello@axonflow.com",
  phone: "+1 (415) 555-0142",
  addressLines: ["548 Market Street, Suite 21", "San Francisco, CA 94104"],
  founded: 2019,
  url: "https://axonflow.com",
  social: {
    linkedin: "https://linkedin.com/company/axonflow",
    x: "https://x.com/axonflow",
    github: "https://github.com/axonflow",
  },
} as const;

export type NavChild = { label: string; to: string; blurb: string };
export type NavGroup = { label: string; to: string; children?: NavChild[] };

export const serviceNav: NavChild[] = [
  {
    label: "Web Development",
    to: "/services/web-development",
    blurb: "The frontend your automation sits behind.",
  },
  {
    label: "AI Automation",
    to: "/services/ai-automation",
    blurb: "Replace manual handoffs with systems that run themselves.",
  },
  {
    label: "Business Process Automation",
    to: "/services/business-process-automation",
    blurb: "Map, rebuild, and instrument your core operating workflows.",
  },
  {
    label: "AI Agents",
    to: "/services/ai-agents",
    blurb: "Task-scoped agents with tools, memory, and human checkpoints.",
  },
  {
    label: "Custom Software",
    to: "/services/custom-software",
    blurb: "Internal platforms built for the way your team actually works.",
  },
  {
    label: "SaaS Development",
    to: "/services/saas-development",
    blurb: "Multi-tenant products from architecture to first paying cohort.",
  },
  {
    label: "CRM Engineering",
    to: "/services/crm",
    blurb: "A revenue system of record your team trusts and uses.",
  },
  {
    label: "GTM Engineering",
    to: "/services/gtm-engineering",
    blurb: "Pipeline infrastructure: data, signals, sequencing, attribution.",
  },
];

export const solutionNav: NavChild[] = [
  { label: "Sales", to: "/solutions/sales", blurb: "Shorter cycles, cleaner data, faster follow-up." },
  {
    label: "Marketing",
    to: "/solutions/marketing",
    blurb: "Compounding content and campaign operations.",
  },
  { label: "HR & People", to: "/solutions/hr", blurb: "Hiring and onboarding without the busywork." },
  {
    label: "Finance",
    to: "/solutions/finance",
    blurb: "Close faster with reconciliation that runs itself.",
  },
  {
    label: "Knowledge Management",
    to: "/solutions/knowledge-management",
    blurb: "One retrieval layer across every source of truth.",
  },
  {
    label: "Custom AI Assistants",
    to: "/solutions/custom-ai-assistants",
    blurb: "Domain assistants scoped to your data and rules.",
  },
];

export const industryNav: NavChild[] = [
  { label: "Technology & SaaS", to: "/industries/saas", blurb: "Business Operations Automation" },
  { label: "Healthcare", to: "/industries/healthcare", blurb: "Patient Engagement & Appointment Automation" },
  { label: "Finance & Accounting", to: "/industries/finance", blurb: "GST & Financial Reconciliation Automation" },
  { label: "Banking & Financial Services", to: "/industries/banking", blurb: "KYC & Customer Onboarding Automation" },
  { label: "Logistics & Supply Chain", to: "/industries/logistics", blurb: "Inventory & Procurement Automation" },
  { label: "Manufacturing & Industrial", to: "/industries/manufacturing", blurb: "Production & Shift Reporting Automation" },
  { label: "Retail & D2C", to: "/industries/retail", blurb: "Product Catalog & eCommerce Automation" },
  { label: "Marketing & Advertising", to: "/industries/marketing", blurb: "AI Content & Campaign Automation" },
  { label: "Real Estate", to: "/industries/real-estate", blurb: "Lead Management & CRM Automation" },
  { label: "Education & EdTech", to: "/industries/education", blurb: "AI Lesson Planning & Content Automation" },
  { label: "HR & Recruitment", to: "/industries/hr", blurb: "Resume Screening & Hiring Automation" },
  { label: "Media & Publishing", to: "/industries/media", blurb: "AI Content Creation & Publishing Automation" },
  { label: "Hospitality & Tourism", to: "/industries/hospitality", blurb: "Revenue Management & Booking Automation" },
  { label: "Government & Public Sector", to: "/industries/government", blurb: "RTI & Citizen Service Automation" },
];

export const solutionsAndIndustriesNav: NavChild[] = [
  ...solutionNav,
  ...industryNav,
];

export const mainNav: NavGroup[] = [
  { label: "Services", to: "/services", children: serviceNav },
  { label: "Solutions & Industries", to: "/solutions", children: solutionsAndIndustriesNav },
  { label: "Portfolio", to: "/case-studies" },
  { label: "Blogs", to: "/blogs" },
];

export const footerNav = [
  { title: "Services", links: serviceNav.map(({ label, to }) => ({ label, to })) },
  {
    title: "Solutions & Industries",
    links: [
      ...solutionNav.map(({ label, to }) => ({ label: `Solution: ${label}`, to })),
      ...industryNav.map(({ label, to }) => ({ label: `Industry: ${label}`, to })),
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Portfolio", to: "/case-studies" },
      { label: "Blogs", to: "/blogs" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export const trustedBy = [
  "Technology & SaaS",
  "Healthcare",
  "Finance & Accounting",
  "Banking & Financial Services",
  "Logistics & Supply Chain",
  "Manufacturing & Industrial",
  "Retail & D2C (Direct-to-Consumer)",
  "Marketing & Advertising",
  "Real Estate",
  "Education & EdTech",
  "Human Resources & Recruitment",
  "Media & Publishing",
  "Hospitality & Tourism",
  "Government & Public Sector",
];

