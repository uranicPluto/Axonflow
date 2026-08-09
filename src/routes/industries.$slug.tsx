import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  ButtonLink,
  Container,
  Eyebrow,
  MetricStrip,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { caseStudies } from "@/content/case-studies";
import { getIndustry, industries } from "@/content/industries";

export const Route = createFileRoute("/industries/$slug")({
  loader: ({ params }) => {
    const industry = getIndustry(params.slug);
    if (!industry) throw notFound();
    return industry;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      ...pageMeta({
        title: `${loaderData.name} — ${loaderData.headline}`,
        description: loaderData.summary,
        path: `/industries/${loaderData.slug}`,
      }),
      ...jsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Industries",
            item: "https://axonflow.com/industries",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: loaderData.name,
            item: `https://axonflow.com/industries/${loaderData.slug}`,
          },
        ],
      }),
    };
  },
  notFoundComponent: IndustryNotFound,
  component: IndustryDetail,
});

function IndustryNotFound() {
  return (
    <Section>
      <Container className="text-center">
        <Eyebrow className="justify-center">Not found</Eyebrow>
        <h1 className="mt-6 font-display text-3xl font-medium">
          We don't have that industry page.
        </h1>
        <p className="mt-4 text-muted-foreground">Have a look at the industries we do cover.</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink to="/industries">Browse industries</ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

function IndustryDetail() {
  const industry = Route.useLoaderData();
  const related = caseStudies.filter((cs) => cs.industry === industry.name);
  const otherIndustries = industries.filter((i) => i.slug !== industry.slug).slice(0, 3);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative pt-16 pb-10 sm:pt-24">
          <Reveal>
            <Eyebrow>{industry.name}</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.02] font-medium sm:text-5xl md:text-[3.4rem]">
              {industry.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {industry.summary}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/contact" size="lg">
                Book a discovery call
                <ArrowRight />
              </ButtonLink>
              <ButtonLink to="/industries" size="lg" variant="outline">
                All industries
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <MetricStrip metrics={industry.proof} />
          </Reveal>
        </Container>
      </div>

      {/* PRESSURES */}
      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="What we hear from operators"
            title="The pressures that define this sector."
            lede="These are the constraints we design against before writing a line of a workflow."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {industry.pressures.map((p: string, i: number) => (
              <Reveal
                key={p}
                delay={i * 0.06}
                className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-6"
              >
                <span className="mt-1 font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[0.9375rem] leading-relaxed text-foreground">{p}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* WORKLOADS */}
      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="Where we build"
            title="The workloads we automate most often."
            lede="A starting map, not an exhaustive one — most engagements begin with one of these and expand."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {industry.workloads.map((w: { title: string; body: string }, i: number) => (
              <Reveal
                key={w.title}
                delay={i * 0.07}
                className="rounded-3xl border border-hairline bg-card p-7"
              >
                <h3 className="font-display text-lg font-medium">{w.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {w.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* COMPLIANCE */}
      <Section tone="ink">
        <Container size="wide">
          <SectionHeader
            eyebrow="Compliance posture"
            title="Built to survive the audit, not just the demo."
            lede="Non-negotiables we design into every system in this sector."
            align="left"
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink-foreground/15 bg-ink-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
            {industry.compliance.map((c: string, i: number) => (
              <Reveal key={c} delay={i * 0.06} className="bg-ink p-6">
                <p className="text-sm leading-relaxed text-ink-foreground/85">{c}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* RELATED CASE STUDIES */}
      {related.length > 0 ? (
        <Section>
          <Container size="wide">
            <SectionHeader
              eyebrow="Proof in this sector"
              title="Engagements in this industry."
              lede="Full breakdowns of the challenge, the build, and the measured outcome."
            />
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {related.map((cs, i) => (
                <Reveal key={cs.slug} delay={i * 0.08}>
                  <Link
                    to="/case-studies/$slug"
                    params={{ slug: cs.slug }}
                    className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                  >
                    <div>
                      <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                        {cs.client}
                      </p>
                      <h3 className="mt-4 font-display text-xl leading-snug font-medium">
                        {cs.title}
                      </h3>
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 text-[0.8125rem] font-medium">
                      Read the engagement
                      <ArrowRight />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* OTHER INDUSTRIES */}
      <Section tone="surface">
        <Container size="wide">
          <SectionHeader eyebrow="Explore more" title="Other industries we work in." />
          <div className="mt-10 flex flex-wrap gap-3">
            {otherIndustries.map((i) => (
              <Link
                key={i.slug}
                to="/industries/$slug"
                params={{ slug: i.slug }}
                className="rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
              >
                {i.name}
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow={`For ${industry.name} teams`}
        title="Let's map the automatable work in your operation."
        body="A discovery call scoped to your workflows, your data boundary, and your compliance requirements."
      />
    </>
  );
}
