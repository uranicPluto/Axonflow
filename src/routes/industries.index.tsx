import { createFileRoute, Link } from "@tanstack/react-router";

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

export const Route = createFileRoute("/industries/")({
  head: () => ({
    ...pageMeta({
      title: "Industries — regulated, operational AI automation",
      description:
        "How we build automation for healthcare, financial services, SaaS, manufacturing, retail, and logistics — with the regulatory and operational context each sector demands.",
      path: "/industries",
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
      ],
    }),
  }),
  component: IndustriesIndex,
});

function IndustriesIndex() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative pt-16 pb-10 sm:pt-24">
          <Reveal>
            <Eyebrow>Industries</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.02] font-medium sm:text-5xl md:text-[3.4rem]">
              Automation built for the rules your industry actually operates under.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Every sector has a different definition of acceptable risk, evidence, and speed. We
              start there — not with a generic workflow — and build systems that hold up to the
              regulator, the auditor, or the board, whichever is watching.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-4 lg:grid-cols-2">
            {industries.map((ind, i) => (
              <Reveal key={ind.slug} delay={i * 0.06}>
                <Link
                  to="/industries/$slug"
                  params={{ slug: ind.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float sm:p-8"
                >
                  <div>
                    <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      {ind.name}
                    </p>
                    <h2 className="mt-4 font-display text-2xl leading-snug font-medium">
                      {ind.headline}
                    </h2>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {ind.summary}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="grid grid-cols-3 gap-4 border-t border-hairline pt-6">
                      {ind.proof.map((p) => (
                        <div key={p.label}>
                          <p className="font-display text-xl font-medium text-primary">{p.value}</p>
                          <p className="mt-1 text-xs leading-snug text-muted-foreground">
                            {p.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium">
                      See the industry
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
            eyebrow="How we operate"
            title="Regulatory context first, workflow second."
            lede="Compliance is not a checklist we run at the end. It shapes which data can move, who reviews what, and how every decision is logged from day one."
          />
        </Container>
      </Section>

      <CtaBand
        eyebrow="Talk to us about your industry"
        title="Tell us the workflow and the regulator, and we'll tell you what's automatable."
        body="A 30-minute discovery call scoped to your sector's constraints — not a generic automation pitch."
      />
    </>
  );
}
