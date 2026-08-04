import { createFileRoute, Link } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  Container,
  Eyebrow,
  MetricStrip,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { Testimonials } from "@/components/site/Testimonials";
import { caseStudies } from "@/content/case-studies";
import { testimonials } from "@/content/shared";

export const Route = createFileRoute("/case-studies/")({
  head: () => ({
    ...pageMeta({
      title: "Portfolio — Measured Automation Case Studies & Outcomes",
      description:
        "Our portfolio of full engagement breakdowns across healthcare, financial services, SaaS, and manufacturing — with hard ROI numbers.",
      path: "/case-studies",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ "@type": "ListItem", position: 1, name: "Portfolio", item: "https://axonflow.com/case-studies" }],
    }),
  }),
  component: CaseStudiesIndex,
});

const aggregate = [
  { value: "500+", label: "Hours saved per client engagement" },
  { value: "$6.6M", label: "Combined annual value created" },
  { value: "4", label: "Industries, four different constraints" },
  { value: "16 wks", label: "Median time to first production system" },
];

function CaseStudiesIndex() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative pt-16 pb-10 sm:pt-24">
          <Reveal>
            <Eyebrow>Portfolio</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.02] font-medium sm:text-5xl md:text-[3.4rem]">
              Our portfolio of measured case studies &amp; outcomes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Every engagement in our portfolio started with an instrumented baseline of the legacy workflow. That's why
              the numbers are this specific — they're the same numbers our client board saw.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-14">
            <MetricStrip metrics={aggregate} />
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-4 lg:grid-cols-2">
            {caseStudies.map((cs, i) => (
              <Reveal key={cs.slug} delay={i * 0.07}>
                <Link
                  to="/case-studies/$slug"
                  params={{ slug: cs.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float sm:p-8"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      <span>{cs.industry}</span>
                      <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
                      <span>{cs.service}</span>
                    </div>
                    <h2 className="mt-5 font-display text-2xl leading-snug font-medium">{cs.title}</h2>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{cs.summary}</p>
                  </div>
                  <div className="mt-8">
                    <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-6">
                      {cs.roi.slice(0, 2).map((r) => (
                        <div key={r.label}>
                          <p className="font-display text-2xl font-medium text-primary">{r.value}</p>
                          <p className="mt-1 text-xs leading-snug text-muted-foreground">{r.label}</p>
                        </div>
                      ))}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium">
                      Read the engagement
                      <ArrowRight />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="From the people who lived it"
            title="Not our words. Theirs."
          />
          <div className="mt-14">
            <Testimonials items={testimonials} />
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Yours could be next"
        title="We'll baseline your workflow before we propose anything."
        body="If the numbers don't justify the build, we'll tell you that too."
        secondaryTo="/industries"
        secondaryLabel="See your industry"
      />
    </>
  );
}
