import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

import { BookingModal } from "@/components/site/BookingModal";
import { CtaBand } from "@/components/site/CtaBand";
import { Faq, LogoTicker } from "@/components/site/Testimonials";
import { VideoPlaceholder } from "@/components/site/VideoPlaceholder";
import { WorkflowGraph } from "@/components/site/WorkflowGraph";
import {
  ArrowRight,
  ButtonLink,
  Container,
  CountUp,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, organizationSchema, pageMeta } from "@/components/site/seo";
import { caseStudies } from "@/content/case-studies";
import { heroMetrics, homeFaqs } from "@/content/shared";
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
          <div className="grid items-center gap-14 pt-16 pb-16 sm:pt-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:pt-28">
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
        </Container>
      </div>

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

      {/* ---------------- INDUSTRIES TICKER ---------------- */}
      <Section className="py-12 border-y border-hairline bg-card/20">
        <Container size="wide">
          <LogoTicker items={trustedBy} label="Industries we've transformed." />
        </Container>
      </Section>

      {/* ---------------- PORTFOLIO ---------------- */}
      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="WHAT WE'VE BUILT"
            title="Real problems solved. Real numbers."
            lede="AI automation and web development projects for startups, agencies, and growing businesses. All live and in production."
            action={
              <ButtonLink to="/case-studies" variant="outline" size="sm">
                View Portfolio
                <ArrowRight />
              </ButtonLink>
            }
          />

          <div className="mt-14 grid gap-4 lg:grid-cols-2">
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
        </Container>
      </Section>

      {/* ---------------- THE TEAM ---------------- */}
      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-14 items-center lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
            <Reveal>
              <Eyebrow>the team</Eyebrow>
              <h2 className="mt-6 text-3xl leading-[1.06] font-medium sm:text-4xl md:text-[2.7rem]">
                Small team. Serious output.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                We built {brand.name} because we kept seeing the same thing — great businesses held back by manual processes and disconnected tools. We're builders based in Pune. We fix that.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="group relative overflow-hidden rounded-3xl border border-hairline bg-card p-4 shadow-float transition-all duration-300 hover:border-primary/25 hover:shadow-glow">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-hairline/60 bg-surface/90">
                  <img
                    src="/founder.png"
                    alt="Jay Mahale"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60" />
                </div>
                <div className="mt-5 px-2">
                  <h3 className="font-display text-xl font-medium text-foreground">Jay Mahale</h3>
                  <p className="mt-1 text-sm font-medium text-primary">Founder &amp; Automation Engineer</p>
                </div>
              </div>
            </Reveal>
          </div>
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

