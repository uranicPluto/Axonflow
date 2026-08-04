import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
import { principles, processStages } from "@/content/company";
import { insights } from "@/content/insights";
import { brand } from "@/content/site";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    ...pageMeta({
      title: "Blogs & Field Notes — Process, Insights & Automation Strategy",
      description: `Field notes on automation ROI, process engineering, agent architectures, and delivery discipline from the ${brand.name} team.`,
      path: "/blogs",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${brand.name} Blogs`,
      description: `Field notes on automation ROI, process engineering, agent architectures, and delivery discipline from the ${brand.name} team.`,
    }),
  }),
  component: BlogsIndex,
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function BlogsIndex() {
  const [activeTab, setActiveTab] = useState<"all" | "articles" | "process">("all");
  const categories = useMemo(() => ["All", ...Array.from(new Set(insights.map((i) => i.category)))], []);
  const [activeCategory, setActiveCategory] = useState("All");

  const [featured, ...rest] = insights;
  const featuredInsight = featured!;
  const filteredInsights = activeCategory === "All" ? rest : rest.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-16 sm:py-24">
          <Reveal>
            <Eyebrow>{brand.name} Blogs &amp; Process</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              Insights, engineering notes &amp; how we work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Written by the team building systems in production. Explore our article insights, field notes, and complete 6-stage engineering process.
            </p>
          </Reveal>

          {/* Navigation Tabs */}
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
              All Posts &amp; Process
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("articles")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "articles"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              Articles &amp; Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("process")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "process"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              How We Work (Process)
            </button>
          </div>
        </Container>
      </div>

      {/* ---------------- INSIGHTS / ARTICLES ---------------- */}
      {activeTab !== "process" && (
        <>
          {activeCategory === "All" ? (
            <Section className="pt-0 sm:pt-0">
              <Container size="wide">
                <Reveal>
                  <Link
                    to="/insights/$slug"
                    params={{ slug: featuredInsight.slug }}
                    className="group grid gap-8 overflow-hidden rounded-3xl border border-hairline bg-secondary/50 p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float sm:p-10 lg:grid-cols-[1.1fr_1fr]"
                  >
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                        <span>Featured Blog</span>
                        <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
                        <span>{featuredInsight.category}</span>
                      </div>
                      <h2 className="mt-5 font-display text-2xl leading-snug font-medium sm:text-3xl md:text-[2.2rem]">
                        {featuredInsight.title}
                      </h2>
                      <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
                        {featuredInsight.excerpt}
                      </p>
                      <div className="mt-7 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{featuredInsight.author}</span>
                        <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
                        <span>{formatDate(featuredInsight.date)}</span>
                        <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
                        <span>{featuredInsight.readTime} read</span>
                      </div>
                      <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Read full blog post
                        <ArrowRight />
                      </span>
                    </div>
                    <div className="flex items-center justify-center rounded-2xl border border-hairline bg-surface p-8">
                      <p className="font-display text-5xl leading-none font-medium text-primary/25 sm:text-6xl">
                        01
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </Container>
            </Section>
          ) : null}

          <Section tone="surface" className="pt-0 sm:pt-0">
            <Container size="wide">
              <SectionHeader eyebrow="Recent Blogs" title="Latest Articles & Insights" />
              
              {/* Category Filter */}
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-300 ${
                      activeCategory === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-hairline bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredInsights.map((insight, i) => (
                  <Reveal key={insight.slug} delay={i * 0.05}>
                    <Link
                      to="/insights/$slug"
                      params={{ slug: insight.slug }}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-card p-6 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float sm:p-7"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                          <span>{insight.category}</span>
                          <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
                          <span>{insight.readTime}</span>
                        </div>
                        <h3 className="mt-4 font-display text-lg leading-snug font-medium">{insight.title}</h3>
                        <p className="mt-3 text-[0.875rem] leading-relaxed text-muted-foreground">{insight.excerpt}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5 text-xs text-muted-foreground">
                        <span>{insight.author}</span>
                        <span>{formatDate(insight.date)}</span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Container>
          </Section>
        </>
      )}

      {/* ---------------- PROCESS SECTION ---------------- */}
      {activeTab !== "articles" && (
        <Section tone={activeTab === "process" ? "default" : "surface"}>
          <Container size="wide">
            <SectionHeader
              eyebrow="How We Work"
              title="Six Stages. One Accountable Process."
              lede="Each stage has a duration, a promise, and deliverables you can hold us to."
            />

            <div className="relative mt-16">
              <div
                className="absolute top-0 bottom-0 left-[27px] hidden w-px bg-hairline sm:block"
                aria-hidden
              />
              <ol className="space-y-10">
                {processStages.map((stage, i) => (
                  <Reveal as="li" key={stage.number} delay={i * 0.06}>
                    <div className="grid gap-6 sm:grid-cols-[56px_1fr] sm:gap-8">
                      <div className="relative hidden sm:block">
                        <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-surface font-display text-lg font-medium">
                          {stage.number}
                        </span>
                      </div>
                      <div className="rounded-3xl border border-hairline bg-card p-7 sm:p-8">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-[0.7rem] tracking-widest text-primary uppercase sm:hidden">
                            {stage.number}
                          </span>
                          <h3 className="font-display text-xl font-medium sm:text-2xl">{stage.name}</h3>
                          <span className="rounded-full border border-hairline bg-secondary/50 px-3 py-1 font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                            {stage.duration}
                          </span>
                        </div>
                        <p className="mt-4 font-display text-lg leading-snug font-medium text-primary">
                          {stage.promise}
                        </p>
                        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{stage.detail}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            <div className="mt-16 border-t border-hairline pt-14">
              <SectionHeader eyebrow="Operating principles" title="Our rules for shipping code" />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {principles.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.07} className="rounded-3xl border border-hairline bg-surface p-7">
                    <h3 className="font-display text-lg font-medium">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        eyebrow="Stay updated"
        title="Ready to automate your team's manual work?"
        body="Book a discovery call to discuss your process and see how we turn complex operations into automated workflows."
      />
    </>
  );
}
