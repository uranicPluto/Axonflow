import { createFileRoute, Link } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import { ComparisonSection } from "@/components/site/ComparisonTable";
import { RoiSection } from "@/components/site/RoiCalculator";
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
import { comparisonHiring } from "@/content/shared";
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

      {/* ---------------- SERVICES BENTO ---------------- */}
      <Section tone="surface" className="pt-0 sm:pt-0">
        <Container size="wide">
          <div className="grid auto-rows-[minmax(0,1fr)] gap-4 md:grid-cols-6">
            {services.map((service, i) => {
              const span =
                i === 0
                  ? "md:col-span-4 md:row-span-2"
                  : i === 1
                    ? "md:col-span-2"
                    : i === 2
                      ? "md:col-span-2"
                      : i === 3
                        ? "md:col-span-3"
                        : i === 4
                          ? "md:col-span-3"
                          : "md:col-span-2";
              const large = i === 0;
              return (
                <Reveal key={service.slug} delay={i * 0.05} className={span}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: service.slug }}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-hairline bg-card p-6 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float sm:p-7"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(600px circle at 20% 0%, color-mix(in oklab, var(--color-primary) 7%, transparent), transparent 55%)",
                      }}
                      aria-hidden
                    />
                    <div className="relative">
                      <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3
                        className={
                          large
                            ? "mt-5 font-display text-2xl font-medium sm:text-[2rem]"
                            : "mt-5 font-display text-lg font-medium"
                        }
                      >
                        {service.name}
                      </h3>
                      <p
                        className={
                          large
                            ? "mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground"
                            : "mt-3 text-[0.875rem] leading-relaxed text-muted-foreground"
                        }
                      >
                        {large ? service.summary : service.kicker}
                      </p>
                    </div>

                    {large ? (
                      <div className="relative mt-8 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
                        {service.outcomes.map((o) => (
                          <div key={o.label} className="bg-surface p-4">
                            <p className="font-display text-xl font-medium text-primary">{o.value}</p>
                            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{o.label}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <span className="relative mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-primary">
                      Explore
                      <ArrowRight />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ---------------- HOW WE ENGAGE ---------------- */}
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

      {/* ---------------- ROI ---------------- */}
      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="Savings model"
            title="Put your own numbers in."
            lede="A rough model beats no model. Move the sliders to see the shape of the business case for one function in your company."
          />
          <div className="mt-14">
            <RoiSection />
          </div>
        </Container>
      </Section>

      {/* ---------------- COMPARISON ---------------- */}
      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="The honest comparison"
            title="Headcount is not the only way to add capacity."
            lede="We are not arguing against hiring. We are arguing against hiring to do work that a well-engineered system does better, cheaper, and with a complete audit trail."
          />
          <div className="mt-14">
            <ComparisonSection data={comparisonHiring} />
          </div>
        </Container>
      </Section>

      {/* ---------------- FAQ ---------------- */}
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
