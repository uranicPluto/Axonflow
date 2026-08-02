import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { industries } from "@/content/industries";
import { solutions } from "@/content/solutions";
import { brand } from "@/content/site";

export const Route = createFileRoute("/solutions/")({
  head: () => ({
    ...pageMeta({
      title: "Solutions & Industries — AI Automation by Department & Sector",
      description:
        "Explore AI automation solutions by department (Sales, Marketing, HR, Finance) and by industry (Healthcare, Finance, SaaS, Manufacturing, Retail, Logistics).",
      path: "/solutions",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [
        ...solutions.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.department,
          url: `${brand.url}/solutions/${s.slug}`,
        })),
        ...industries.map((ind, i) => ({
          "@type": "ListItem",
          position: solutions.length + i + 1,
          name: ind.name,
          url: `${brand.url}/industries/${ind.slug}`,
        })),
      ],
    }),
  }),
  component: SolutionsAndIndustriesIndex,
});

export function SolutionsAndIndustriesIndex() {
  const [activeTab, setActiveTab] = useState<"all" | "solutions" | "industries">("all");

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="line-grid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
        <Container size="wide" className="relative pt-16 pb-16 sm:pt-24 sm:pb-20">
          <Reveal>
            <Eyebrow>Solutions &amp; Industries</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.6rem]">
              Tailored solutions by department and industry.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Whether you need departmental automation (Sales, Finance, HR) or sector-specific compliance and workflows (Healthcare, Financial Services, Manufacturing), we build systems engineered for your domain.
            </p>
          </Reveal>

          {/* Filter Tabs */}
          <div className="mt-10 flex flex-wrap gap-3 border-b border-hairline pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              All Solutions &amp; Industries
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("solutions")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "solutions"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              By Department
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("industries")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "industries"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              By Industry Sector
            </button>
          </div>
        </Container>
      </div>

      {/* ---------------- DEPARTMENTAL SOLUTIONS ---------------- */}
      {activeTab !== "industries" && (
        <Section tone="surface" className="pt-0 sm:pt-0">
          <Container size="wide">
            <SectionHeader
              eyebrow="Solutions by Department"
              title="Departmental playbooks & automation"
              lede="High-volume, rule-driven work rebuilt around your existing tools."
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {solutions.map((s, i) => (
                <Reveal key={s.slug} delay={i * 0.06}>
                  <Link
                    to="/solutions/$slug"
                    params={{ slug: s.slug }}
                    className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                  >
                    <div>
                      <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">{s.department}</p>
                      <h2 className="mt-4 font-display text-xl leading-snug font-medium">{s.headline}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                    </div>
                    <div className="mt-8">
                      <div className="grid grid-cols-3 gap-4 border-t border-hairline pt-6">
                        {s.metrics.map((m) => (
                          <div key={m.label}>
                            <p className="font-display text-lg font-medium text-primary">{m.value}</p>
                            <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">{m.label}</p>
                          </div>
                        ))}
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium">
                        See the playbook
                        <ArrowRight />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ---------------- INDUSTRY SOLUTIONS ---------------- */}
      {activeTab !== "solutions" && (
        <Section tone={activeTab === "industries" ? "surface" : "default"}>
          <Container size="wide">
            <SectionHeader
              eyebrow="Solutions by Industry"
              title="Industry Sector Expertise"
              lede="Compliant, auditable architectures built to withstand regulatory and operational constraints."
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {industries.map((ind, i) => (
                <Reveal key={ind.slug} delay={i * 0.06}>
                  <Link
                    to="/industries/$slug"
                    params={{ slug: ind.slug }}
                    className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-card p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                  >
                    <div>
                      <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">{ind.name}</p>
                      <h2 className="mt-4 font-display text-xl leading-snug font-medium">{ind.headline}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ind.summary}</p>
                    </div>
                    <div className="mt-8">
                      <div className="grid grid-cols-3 gap-4 border-t border-hairline pt-6">
                        {ind.proof.map((p) => (
                          <div key={p.label}>
                            <p className="font-display text-lg font-medium text-primary">{p.value}</p>
                            <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">{p.label}</p>
                          </div>
                        ))}
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium">
                        Explore industry solution
                        <ArrowRight />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        eyebrow="Next step"
        title="Find the right solution for your organization."
        body="Schedule a discovery call to review your current processes and map out an automation roadmap."
      />
    </>
  );
}
