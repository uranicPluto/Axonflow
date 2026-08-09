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
import { benefits, careerValues, roles } from "@/content/careers";
import { brand } from "@/content/site";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    ...pageMeta({
      title: "Careers — Build the systems, not the slideware",
      description:
        "Nineteen people building production AI and automation systems for real operators. Open roles across delivery, applied AI, GTM engineering, and leadership.",
      path: "/careers",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: roles.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.title,
        url: `${brand.url}/careers/${r.slug}`,
      })),
    }),
  }),
  component: CareersIndex,
});

const process = [
  {
    step: "01",
    title: "Intro call",
    body: "30 minutes with the hiring manager on scope, motivation, and mutual fit.",
  },
  {
    step: "02",
    title: "Work sample",
    body: "A real, scoped problem from our engagements — paid if it takes more than a couple of hours.",
  },
  {
    step: "03",
    title: "Team interviews",
    body: "Two conversations: one technical, one on judgment and communication.",
  },
  {
    step: "04",
    title: "Reference & offer",
    body: "Two references, then a clear offer within a week — no black holes.",
  },
];

function CareersIndex() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-16 sm:py-24">
          <Reveal>
            <Eyebrow>Careers</Eyebrow>
            <h1 className="mt-6 max-w-2xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              Nineteen people, real ownership, systems that ship.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              We are a small, deliberately unbloated team building the AI and automation systems
              clients actually run their business on. If that sounds better than another layer of
              process, read on.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section className="pt-0 sm:pt-0">
        <Container size="wide">
          <SectionHeader
            eyebrow="Why work here"
            title={`What is actually true about working at ${brand.name}.`}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {careerValues.map((v, i) => (
              <Reveal
                key={v.title}
                delay={i * 0.06}
                className="rounded-3xl border border-hairline bg-card p-7"
              >
                <h3 className="font-display text-lg font-medium">{v.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-4 rounded-3xl border border-hairline bg-secondary/50 p-7 sm:p-9">
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
              Benefits
            </p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm leading-snug text-foreground/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader eyebrow="Hiring process" title="Four steps, no black holes." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <Reveal
                key={p.step}
                delay={i * 0.06}
                className="rounded-3xl border border-hairline bg-card p-6"
              >
                <p className="font-display text-2xl font-medium text-primary">{p.step}</p>
                <h3 className="mt-4 font-medium">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Join the team"
        title="We still want to hear from you."
        body="Send a note about what you'd want to build and why. We read every message ourselves."
        primaryLabel="Email the team"
        secondaryTo="/contact"
        secondaryLabel="Get in touch"
      />
    </>
  );
}
