import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

import { BookingModal } from "@/components/site/BookingModal";
import { ComparisonSection } from "@/components/site/ComparisonTable";
import { CtaBand } from "@/components/site/CtaBand";
import { RoiSection } from "@/components/site/RoiCalculator";
import { Faq, LogoTicker, Testimonials } from "@/components/site/Testimonials";
import { VideoPlaceholder } from "@/components/site/VideoPlaceholder";
import { WorkflowGraph } from "@/components/site/WorkflowGraph";
import {
  ArrowRight,
  ButtonLink,
  Container,
  CountUp,
  Eyebrow,
  MetricStrip,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, organizationSchema, pageMeta } from "@/components/site/seo";
import { caseStudies } from "@/content/case-studies";
import { services } from "@/content/services";
import { comparisonHiring, heroMetrics, homeFaqs, testimonials } from "@/content/shared";
import { brand, trustedBy } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: `${brand.name} — AI automation & growth engineering`,
      description:
        "We architect the AI systems that run your business — automating operations, removing manual work, and compounding revenue. Measured baselines, owned code, production systems in weeks.",
      path: "/",
    }),
    ...jsonLd(organizationSchema),
  }),
  component: Home,
});

const problems = [
  { stat: "31%", text: "of a knowledge worker's week is spent on tasks a system could handle" },
  { stat: "19%", text: "of process hours are duplicated work caused by disconnected tools" },
  { stat: "6", text: "average number of software tools touched in a single customer request" },
  { stat: "1", text: "person in most companies who genuinely understands the full end-to-end process" },
];

function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const graphY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 70]);
  const graphOpacity = useTransform(scrollYProgress, [0, 0.9], [1, reduced ? 1 : 0.3]);

  const featured = caseStudies.slice(0, 3);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div ref={heroRef} className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute -top-64 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 opacity-[0.13] blur-[120px]"
          style={{ background: "radial-gradient(ellipse, var(--color-primary), transparent 70%)" }}
          aria-hidden
        />
        <Container size="wide" className="relative">
          <div className="grid items-center gap-14 pt-16 pb-10 sm:pt-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:pt-28">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Eyebrow>WEB DEVELOPMENT &amp; AI AUTOMATION</Eyebrow>
                <h1 className="mt-6 text-[2.6rem] leading-[1.04] font-medium text-balance-tight sm:text-[3.4rem] lg:text-[4rem]">
                  Your business should not run on{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">manual work.</span>
                    <motion.span
                      className="absolute inset-x-0 bottom-1.5 z-0 h-3 rounded-full bg-primary/20"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{ originX: 0 }}
                      aria-hidden
                    />
                  </span>
                </h1>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  We build high-performance websites and AI automation systems for startups, SaaS companies, agencies, enterprises, and growing businesses across 14 industries — so your team gets hours back, operations run without intervention, and revenue compounds on its own.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setBookingOpen(true)}
                    className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[0.95rem] font-medium text-primary-foreground shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:translate-y-0"
                  >
                    Book a discovery call
                    <ArrowRight />
                  </button>
                  <ButtonLink to="/case-studies" size="lg" variant="outline">
                    View Portfolio
                  </ButtonLink>
                </div>
                <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
                <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-8">
                  {heroMetrics.map((m) => (
                    <div key={m.label}>
                      <dd className="font-display text-2xl leading-none font-medium sm:text-[1.75rem]">
                        <CountUp value={m.value} />
                      </dd>
                      <dt className="mt-2 text-[0.8125rem] leading-snug text-muted-foreground">{m.label}</dt>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </div>

            <motion.div style={{ y: graphY, opacity: graphOpacity }} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl border border-hairline bg-surface/70 p-4 shadow-float backdrop-blur-sm sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between px-2">
                  <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                    Live orchestration
                  </p>
                  <span className="flex items-center gap-2 font-mono text-[0.7rem] text-primary">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    412 runs today
                  </span>
                </div>
                <WorkflowGraph />
              </motion.div>
            </motion.div>
          </div>

          <div className="border-t border-hairline py-12">
            <LogoTicker items={trustedBy} label="Industries we've transformed." />
          </div>
        </Container>
      </div>

      {/* ---------------- PROBLEM ---------------- */}
      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <Reveal>
              <Eyebrow>THE COST OF THE STATUS QUO</Eyebrow>
              <h2 className="mt-6 text-3xl leading-[1.06] font-medium sm:text-4xl md:text-[2.7rem]">
                Thousands of hours a year, spent on work your systems should already be doing.
              </h2>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                It rarely looks like a crisis. It looks like a sales rep manually updating CRM records, a clinic receptionist confirming appointments one by one, a logistics team copying data between spreadsheets, or a finance team reconciling GST entries at month-end. Individually manageable. Collectively, they are the largest invisible cost in your business — and the most automatable.
              </p>
              <Link to="/solutions" className="group mt-8 inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                Read how we solve this by industry
                <ArrowRight />
              </Link>
            </Reveal>

            <div className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2">
              {problems.map((p, i) => (
                <Reveal key={p.text} delay={i * 0.07} className="bg-surface p-7">
                  <p className="font-display text-4xl leading-none font-medium text-ember">
                    <CountUp value={p.stat} />
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- VIDEO SPACE ---------------- */}
      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="SEE IT WORKING"
            title="Watch a real business problem get solved in 90 seconds."
            lede="We take a manual process that's eating your team's time, map it, automate it, and hand it over — so your team never touches that work again. Here's what that looks like."
          />
          <Reveal className="mt-14">
            <VideoPlaceholder />
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- SERVICES BENTO ---------------- */}
      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="What we build"
            title="Two pillars. One growth system."
            lede="A website that converts visitors into leads. Automation that converts processes into results. Built together, they compound."
            action={
              <ButtonLink to="/services" variant="outline" size="sm">
                All services
                <ArrowRight />
              </ButtonLink>
            }
          />

          <div className="mt-14 grid auto-rows-[minmax(0,1fr)] gap-4 md:grid-cols-6">
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

      {/* ---------------- PORTFOLIO ---------------- */}
      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="Portfolio proof"
            title="Outcomes we can put a figure against."
            lede="Every engagement starts with an instrumented baseline, which is why we can publish results this specific."
            action={
              <ButtonLink to="/case-studies" variant="outline" size="sm">
                View Portfolio
                <ArrowRight />
              </ButtonLink>
            }
          />

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {featured.map((cs, i) => (
              <Reveal key={cs.slug} delay={i * 0.08}>
                <Link
                  to="/case-studies/$slug"
                  params={{ slug: cs.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      <span>{cs.industry}</span>
                      <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
                      <span>{cs.service}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl leading-snug font-medium">{cs.title}</h3>
                    <p className="mt-3 text-[0.875rem] leading-relaxed text-muted-foreground">{cs.summary}</p>
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
                      Read portfolio case study
                      <ArrowRight />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-4">
            <Testimonials items={testimonials} />
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

      {/* ---------------- METRIC STRIP ---------------- */}
      <Section tone="surface">
        <Container size="wide">
          <Reveal>
            <MetricStrip
              metrics={[
                { value: "68", label: "Systems running in production" },
                { value: "412k", label: "Hours returned to client teams" },
                { value: "94%", label: "Clients who extend scope" },
                { value: "6 wks", label: "Median time to first production workflow" },
              ]}
            />
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- FAQ ---------------- */}
      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <Reveal>
              <Eyebrow>Before you call</Eyebrow>
              <h2 className="mt-6 text-3xl leading-[1.06] font-medium sm:text-4xl">
                The questions every serious buyer asks us.
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                If yours is not here,{" "}
                <Link to="/contact" className="text-foreground underline decoration-primary/40 underline-offset-4">
                  ask it directly
                </Link>
                .
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <Faq items={homeFaqs} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}

