import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { caseStudies, getCaseStudy } from "@/content/case-studies";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ params }) => {
    const cs = getCaseStudy(params.slug);
    if (!cs) throw notFound();
    const index = caseStudies.findIndex((c) => c.slug === params.slug);
    const prev = caseStudies[(index - 1 + caseStudies.length) % caseStudies.length]!;
    const next = caseStudies[(index + 1) % caseStudies.length]!;
    return { cs, prev, next };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { cs } = loaderData;
    return {
      ...pageMeta({
        title: cs.title,
        description: cs.summary,
        path: `/case-studies/${cs.slug}`,
      }),
      ...jsonLd({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: cs.title,
        description: cs.summary,
        about: cs.industry,
        author: { "@type": "Organization", name: "Axonflow" },
      }),
    };
  },
  notFoundComponent: CaseStudyNotFound,
  component: CaseStudyDetail,
});

function CaseStudyNotFound() {
  return (
    <Section>
      <Container className="text-center">
        <Eyebrow className="justify-center">Not found</Eyebrow>
        <h1 className="mt-6 font-display text-3xl font-medium">We don't have that case study.</h1>
        <div className="mt-8 flex justify-center">
          <ButtonLink to="/case-studies">Browse case studies</ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

function CaseStudyDetail() {
  const { cs, prev, next } = Route.useLoaderData();

  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute -top-64 left-1/2 h-[520px] w-[900px] -translate-x-1/2 opacity-[0.12] blur-[120px]"
          style={{ background: "radial-gradient(ellipse, var(--color-primary), transparent 70%)" }}
          aria-hidden
        />
        <Container size="narrow" className="relative pt-16 pb-16 text-center sm:pt-24">
          <Reveal>
            <div className="flex items-center justify-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
              <span>{cs.client}</span>
              <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
              <span>{cs.industry}</span>
              <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
              <span>{cs.service}</span>
            </div>
            <h1 className="mt-7 text-4xl leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.6rem]">
              {cs.title}
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">{cs.summary}</p>
          </Reveal>
        </Container>
      </div>

      {/* HEADLINE ROI STRIP */}
      <Section tone="ink" className="py-16 sm:py-20">
        <Container size="wide">
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-ink-foreground/15 bg-ink-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
            {cs.roi.map((r: { value: string; label: string; note: string }, i: number) => (
              <Reveal key={r.label} delay={i * 0.08} className="bg-ink p-8 sm:p-10">
                <dd className="font-display text-5xl leading-none font-medium tracking-tight text-ink-foreground sm:text-6xl">
                  {r.value}
                </dd>
                <dt className="mt-4 text-sm font-medium text-ink-foreground/80">{r.label}</dt>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-foreground/45">{r.note}</p>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>

      {/* CHALLENGE */}
      <Section>
        <Container size="narrow">
          <Reveal>
            <Eyebrow>The challenge</Eyebrow>
            <p className="mt-6 text-2xl leading-[1.4] font-medium text-balance-tight sm:text-[1.9rem]">
              {cs.challenge}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* LEGACY WORKFLOW COST */}
      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="What it cost before"
            title="The legacy workflow, step by step."
            lede="Every step below was measured before a single line of the new system was written."
          />
          <div className="mt-14 divide-y divide-hairline overflow-hidden rounded-3xl border border-hairline bg-surface">
            {cs.legacyWorkflow.map((step: { step: string; detail: string; cost: string }, i: number) => (
              <Reveal
                key={step.step}
                delay={i * 0.05}
                className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-lg font-medium">{step.step}</p>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
                <p className="font-mono text-sm font-medium text-ember shrink-0 sm:pl-6">{step.cost}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* WHAT WE BUILT */}
      <Section>
        <Container size="wide">
          <SectionHeader eyebrow="What we built" title="The system, in plain terms." lede={cs.solution} />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {cs.solutionPillars.map((p: { title: string; body: string }, i: number) => (
              <Reveal key={p.title} delay={i * 0.07} className="rounded-3xl border border-hairline bg-card p-7">
                <h3 className="font-display text-lg font-medium">{p.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ARCHITECTURE */}
      <Section tone="surface">
        <Container size="wide">
          <SectionHeader eyebrow="Architecture" title="How the pieces fit together." />
          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {cs.architecture.layers.map((layer: { name: string; nodes: string[] }, i: number) => (
              <Reveal key={layer.name} delay={i * 0.08} className="rounded-3xl border border-hairline bg-surface p-6">
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">{layer.name}</p>
                <ul className="mt-4 space-y-2.5">
                  {layer.nodes.map((n: string) => (
                    <li key={n} className="rounded-lg border border-hairline bg-card px-3 py-2 text-sm">
                      {n}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground italic">
            {cs.architecture.note}
          </Reveal>
        </Container>
      </Section>

      {/* TIMELINE */}
      <Section>
        <Container size="wide">
          <SectionHeader eyebrow="Timeline" title="From discovery to rollout." />
          <div className="mt-14 space-y-px overflow-hidden rounded-3xl border border-hairline bg-hairline">
            {cs.timeline.map((t: { phase: string; duration: string; detail: string }, i: number) => (
              <Reveal
                key={t.phase}
                delay={i * 0.06}
                className="flex flex-col gap-2 bg-surface p-6 sm:flex-row sm:items-baseline sm:gap-8 sm:p-7"
              >
                <p className="font-mono text-xs tracking-widest text-primary uppercase sm:w-32 sm:shrink-0">
                  {t.duration}
                </p>
                <div>
                  <p className="font-display text-lg font-medium">{t.phase}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* PULL QUOTE */}
      <Section tone="ink">
        <Container size="narrow">
          <Reveal className="text-center">
            <svg viewBox="0 0 32 24" className="mx-auto h-8 w-8 text-primary" fill="currentColor" aria-hidden>
              <path d="M0 24V14.4C0 6.4 4.8 1.2 14.4 0l1.6 3.2C9.6 4.8 6.4 8 6.4 12.8h6.4V24H0zm17.6 0V14.4c0-8 4.8-13.2 14.4-14.4l1.6 3.2c-6.4 1.6-9.6 4.8-9.6 9.6h6.4V24H17.6z" />
            </svg>
            <blockquote className="mt-8 font-display text-2xl leading-[1.35] font-medium text-balance-tight text-ink-foreground sm:text-[2rem]">
              "{cs.quote.text}"
            </blockquote>
            <p className="mt-8 text-sm text-ink-foreground/60">
              <span className="font-medium text-ink-foreground">{cs.quote.name}</span> — {cs.quote.role}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* STACK */}
      <Section>
        <Container size="wide">
          <SectionHeader eyebrow="Stack" title="What it's built on." />
          <div className="mt-10 flex flex-wrap gap-3">
            {cs.stack.map((s: string) => (
              <span
                key={s}
                className="rounded-full border border-hairline bg-surface px-4 py-2 font-mono text-[0.75rem] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {/* PREV / NEXT */}
      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/case-studies/$slug"
              params={{ slug: prev.slug }}
              className="group rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
            >
              <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">Previous</p>
              <p className="mt-3 font-display text-lg font-medium">{prev.title}</p>
            </Link>
            <Link
              to="/case-studies/$slug"
              params={{ slug: next.slug }}
              className="group rounded-3xl border border-hairline bg-surface p-7 text-right transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
            >
              <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">Next</p>
              <p className="mt-3 font-display text-lg font-medium">{next.title}</p>
            </Link>
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Want a similar outcome?"
        title={`Let's baseline your ${cs.industry.toLowerCase()} workflow the same way.`}
        secondaryTo="/case-studies"
        secondaryLabel="More case studies"
      />
    </>
  );
}
