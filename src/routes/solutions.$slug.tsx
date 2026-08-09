import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  ButtonLink,
  Container,
  Eyebrow,
  MetricStrip,
  Pill,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { getSolution, solutions } from "@/content/solutions";
import { brand } from "@/content/site";

export const Route = createFileRoute("/solutions/$slug")({
  loader: ({ params }) => {
    const solution = getSolution(params.slug);
    if (!solution) throw notFound();
    return solution;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      ...pageMeta({
        title: `${loaderData.department} — ${loaderData.headline}`,
        description: loaderData.summary,
        path: `/solutions/${loaderData.slug}`,
      }),
      ...jsonLd({
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: `${loaderData.department} automation`,
        description: loaderData.summary,
        provider: { "@type": "Organization", name: brand.name, url: brand.url },
      }),
    };
  },
  notFoundComponent: SolutionNotFound,
  component: SolutionDetail,
});

function SolutionNotFound() {
  return (
    <Section>
      <Container size="narrow" className="text-center">
        <Eyebrow>Not found</Eyebrow>
        <h1 className="mt-6 font-display text-3xl font-medium">
          We don't have a solution page for that.
        </h1>
        <p className="mt-4 text-muted-foreground">Browse all departments instead.</p>
        <ButtonLink to="/solutions" className="mt-8" variant="outline">
          All solutions
        </ButtonLink>
      </Container>
    </Section>
  );
}

function SolutionDetail() {
  const { slug } = Route.useParams();
  const solution = getSolution(slug);
  if (!solution) return <SolutionNotFound />;
  const others = solutions.filter((s) => s.slug !== solution.slug).slice(0, 3);

  return (
    <>
      <div className="relative overflow-hidden bg-ink text-ink-foreground">
        <div
          className="line-grid pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-[110px]"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
          aria-hidden
        />
        <Container size="wide" className="relative pt-16 pb-16 sm:pt-24 sm:pb-20">
          <Reveal>
            <nav className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-ink-foreground/45 uppercase">
              <Link to="/solutions" className="hover:text-ink-foreground">
                Solutions
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink-foreground/80">{solution.department}</span>
            </nav>
            <Eyebrow className="mt-6 text-ink-foreground/50 [&>span]:bg-primary">
              {solution.department}
            </Eyebrow>
            <h1 className="mt-6 max-w-3xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              {solution.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-foreground/65">
              {solution.summary}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/contact" size="lg">
                Book a discovery call
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                to="/solutions"
                size="lg"
                variant="ghost"
                className="border border-ink-foreground/20 text-ink-foreground hover:bg-ink-foreground/10"
              >
                All departments
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <MetricStrip metrics={solution.metrics} tone="dark" />
          </Reveal>
        </Container>
      </div>

      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <Eyebrow>What's actually broken</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-medium sm:text-4xl">
                The problems behind the metrics.
              </h2>
              <p className="mt-5 text-muted-foreground">
                Every play on the right exists because one of these keeps showing up in discovery.
              </p>
              <ul className="mt-8 flex flex-col gap-4">
                {solution.problems.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 border-l-2 border-hairline pl-4 text-[0.9375rem] leading-relaxed text-foreground"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div>
              <Eyebrow>The playbook</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-medium sm:text-4xl">
                What we build for {solution.department.toLowerCase()}.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {solution.plays.map((play, i) => (
                  <Reveal
                    key={play.title}
                    delay={i * 0.06}
                    className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-6"
                  >
                    <div>
                      <h3 className="font-display text-lg font-medium">{play.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {play.body}
                      </p>
                    </div>
                    <p className="mt-6 inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 font-mono text-[0.7rem] text-accent-foreground uppercase tracking-wide">
                      {play.impact}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="Fits your stack"
            title="Works with what you already run."
            lede="We plug into the tools your team lives in — no forced migration to hit these numbers."
          />
          <Reveal className="mt-10 flex flex-wrap gap-2.5">
            {solution.integrations.map((tool) => (
              <Pill key={tool}>{tool}</Pill>
            ))}
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader eyebrow="Other departments" title="More systems worth rebuilding." />
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {others.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.07}>
                <Link
                  to="/solutions/$slug"
                  params={{ slug: s.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                >
                  <div>
                    <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      {s.department}
                    </p>
                    <h3 className="mt-4 font-display text-lg font-medium">{s.headline}</h3>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-primary">
                    Explore
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Next step"
        title={`Ready to rebuild ${solution.department.toLowerCase()}?`}
        body="A 30-minute discovery call. We'll walk through your current process and tell you which play pays back first."
      />
    </>
  );
}
