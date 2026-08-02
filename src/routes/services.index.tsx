import { createFileRoute, Link } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import { Faq } from "@/components/site/Testimonials";
import {
  ArrowRight,
  Container,
  CountUp,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { services } from "@/content/services";
import { brand } from "@/content/site";

export const Route = createFileRoute("/services/")({
  head: () => ({
    ...pageMeta({
      title: "Services — AI automation, agents, software & GTM engineering",
      description:
        "Eight disciplines, one operating thesis: deterministic where it must be, intelligent where it helps, measured everywhere. Explore how Axonflow builds and ships each.",
      path: "/services",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `${brand.url}/services/${s.slug}`,
      })),
    }),
  }),
  component: ServicesIndex,
});

const engagementSteps = [
  { step: "01", title: "Baseline", body: "We instrument the current state before proposing anything, so ROI has a number to compare against." },
  { step: "02", title: "Scope", body: "A fixed-scope plan with named deliverables, timelines, and the metric that proves it worked." },
  { step: "03", title: "Build", body: "Embedded delivery, typically 2–12 weeks to a production system, not a prototype." },
  { step: "04", title: "Operate", body: "Monitoring, evaluation, and an optional retainer once the system is live and earning trust." },
];

const faqs = [
  {
    q: "How do you decide which service we need?",
    a: "Most engagements start with a short discovery call. If the scope spans several of these disciplines, we sequence them rather than bundle everything into one contract.",
  },
  {
    q: "Do you work with our existing engineering team?",
    a: "Yes, by default. We embed, pair, and hand over ownership — most clients don't want a permanent dependency on us.",
  },
  {
    q: "What's the typical first engagement size?",
    a: "Fixed-scope builds run 2–12 weeks depending on the service. We rarely start with an open-ended retainer.",
  },
];

function ServicesIndex() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative pt-16 pb-16 sm:pt-24 sm:pb-20">
          <Reveal>
            <Eyebrow>Services</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.6rem]">
              Eight disciplines. One operating thesis.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Deterministic where it must be, intelligent where it helps, measured everywhere. Every service below
              ships as a production system with an owner, not a slide deck.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section tone="surface" className="pt-0 sm:pt-0">
        <Container size="wide">
          <div className="divide-y divide-hairline border-y border-hairline">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={i * 0.04}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="group grid items-center gap-6 py-8 transition-colors duration-300 hover:bg-surface sm:py-10 md:grid-cols-[auto_1fr_auto_auto] md:gap-10"
                >
                  <span className="font-mono text-sm text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="font-display text-2xl font-medium sm:text-[1.65rem]">{service.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{service.kicker}</p>
                  </div>
                  <div className="hidden gap-6 md:flex">
                    {service.outcomes.slice(0, 1).map((o) => (
                      <div key={o.label} className="text-right">
                        <p className="font-display text-xl font-medium text-primary">
                          <CountUp value={o.value} />
                        </p>
                        <p className="max-w-[9rem] text-xs leading-snug text-muted-foreground">{o.label}</p>
                      </div>
                    ))}
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="How we engage"
            title="Four stages, every time."
            lede="The structure doesn't change. What changes is the system we're building it around."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {engagementSteps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.07} className="bg-surface p-7">
                <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">{s.step}</p>
                <h3 className="mt-4 font-display text-lg font-medium">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="narrow">
          <SectionHeader eyebrow="Questions" title="Before you book a call." align="left" />
          <div className="mt-12">
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Not sure which service fits?"
        body="Tell us what's costing your team hours and we'll tell you honestly which of these — if any — is the right first move."
      />
    </>
  );
}
