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
import { insights } from "@/content/insights";
import { brand } from "@/content/site";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    ...pageMeta({
      title: "Insights — Notes from the engagements",
      description:
        "Field notes on automation ROI, agent permissions, CRM adoption, and delivery discipline, written by the people who ship the systems.",
      path: "/insights",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: insights.map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: i.title,
        url: `${brand.url}/insights/${i.slug}`,
      })),
    }),
  }),
  component: InsightsIndex,
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function InsightsIndex() {
  const categories = useMemo(() => ["All", ...Array.from(new Set(insights.map((i) => i.category)))], []);
  const [active, setActive] = useState("All");

  const [featured, ...rest] = insights;
  const featuredInsight = featured!;
  const filtered = active === "All" ? rest : rest.filter((i) => i.category === active);
  const showFeatured = active === "All" || featuredInsight.category === active;

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-16 sm:py-24">
          <Reveal>
            <Eyebrow>Insights</Eyebrow>
            <h1 className="mt-6 max-w-2xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              Field notes from the engagements, not the marketing calendar.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Everything here was written by the person who did the work — measurement, agents, revenue systems,
              and delivery discipline.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                  active === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-hairline bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {showFeatured ? (
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
                    <span>Featured</span>
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
                    Read the piece
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
          <SectionHeader eyebrow="All articles" title="Recent notes" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((insight, i) => (
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
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No articles in this category yet.</p>
            ) : null}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Want the raw numbers?"
        title="See the same discipline applied to a live engagement."
        secondaryTo="/case-studies"
        secondaryLabel="Read case studies"
      />
    </>
  );
}
