import { createFileRoute } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { jsonLd, organizationSchema, pageMeta } from "@/components/site/seo";
import { principles, processStages } from "@/content/company";
import { brand } from "@/content/site";

export const Route = createFileRoute("/process")({
  head: () => ({
    ...pageMeta({
      title: "Our process — from diagnostic to ownership",
      description:
        "The six-stage engagement we run at Axonflow: diagnostic, architecture, foundation, build, shadow & cutover, and ownership — with durations, deliverables, and what we ask of your team at each stage.",
      path: "/process",
    }),
    ...jsonLd(organizationSchema),
  }),
  component: Process,
});

const risks = [
  {
    risk: "Scope creep once the team sees what's possible",
    mitigation:
      "Costed delivery plan is fixed at the Architecture stage; new ideas go into a scored backlog, not the current sprint.",
  },
  {
    risk: "The model gets something wrong in production",
    mitigation:
      "Confidence thresholds route uncertain cases to a human, every run is logged and replayable, and a regression suite runs in CI.",
  },
  {
    risk: "Cutover breaks something the old system quietly handled",
    mitigation:
      "Shadow mode runs the new system in parallel until accuracy and cost clear agreed thresholds, then we cut over by segment, never all at once.",
  },
  {
    risk: "Your team can't extend the system after we leave",
    mitigation:
      "Documentation, runbooks, and enablement sessions are a deliverable, not an afterthought — with an optional operating retainer if you'd rather we keep tuning it.",
  },
];

function Process() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-24 sm:py-32">
          <Reveal className="max-w-2xl">
            <Eyebrow>How we work</Eyebrow>
            <h1 className="mt-6 text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              Six stages. One accountable plan. No surprises at cutover.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {brand.positioning} Every engagement follows the same sequence — measured,
              architected, built, and proven in parallel before it ever touches production for real.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="The engagement"
            title="A vertical timeline, not a fixed-price black box."
            lede="Each stage has a duration, a promise, and deliverables you can hold us to — plus what we need from your team to move at that pace."
          />

          <div className="relative mt-16">
            <div
              className="absolute top-0 bottom-0 left-[27px] hidden w-px bg-hairline sm:block"
              aria-hidden
            />
            <ol className="space-y-10">
              {processStages.map((stage, i) => (
                <Reveal as="li" key={stage.number} delay={i * 0.06}>
                  <div className="grid gap-6 sm:grid-cols-[56px_1fr] sm:gap-8">
                    <div className="relative hidden sm:block">
                      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-surface font-display text-lg font-medium">
                        {stage.number}
                      </span>
                    </div>
                    <div className="rounded-3xl border border-hairline bg-card p-7 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[0.7rem] tracking-widest text-primary uppercase sm:hidden">
                          {stage.number}
                        </span>
                        <h3 className="font-display text-xl font-medium sm:text-2xl">
                          {stage.name}
                        </h3>
                        <span className="rounded-full border border-hairline bg-secondary/50 px-3 py-1 font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                          {stage.duration}
                        </span>
                      </div>
                      <p className="mt-4 font-display text-lg leading-snug font-medium text-primary">
                        {stage.promise}
                      </p>
                      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                        {stage.detail}
                      </p>
                      <div className="mt-6 grid gap-4 border-t border-hairline pt-6 sm:grid-cols-2">
                        <div>
                          <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                            Deliverables
                          </p>
                          <ul className="mt-3 space-y-2">
                            {stage.outputs.map((o) => (
                              <li key={o} className="flex gap-2 text-sm leading-relaxed">
                                <span
                                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                                  aria-hidden
                                />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                            What you do
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {clientAsk(stage.number)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="Operating principles"
            title="The rules we don't bend for a deadline."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal
                key={p.title}
                delay={i * 0.07}
                className="rounded-3xl border border-hairline bg-surface p-7"
              >
                <h3 className="font-display text-lg font-medium">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="Risk, addressed in writing"
            title="What could go wrong, and how we de-risk it."
            lede="We would rather name the failure modes up front than discover them together in week ten."
          />
          <div className="mt-14 grid gap-4 lg:grid-cols-2">
            {risks.map((r, i) => (
              <Reveal
                key={r.risk}
                delay={i * 0.06}
                className="rounded-3xl border border-hairline bg-card p-7"
              >
                <p className="font-mono text-[0.7rem] tracking-widest text-ember uppercase">Risk</p>
                <p className="mt-2 font-display text-lg font-medium">{r.risk}</p>
                <div className="mt-4 flex items-start gap-2 border-t border-hairline pt-4">
                  <ArrowRight className="mt-1 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.mitigation}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Start with diagnostics"
        title="See the first stage applied to your process."
        body="A 30-minute call to scope what a diagnostic would look like for your team, with no commitment beyond that."
      />
    </>
  );
}

function clientAsk(number: string): string {
  const asks: Record<string, string> = {
    "01": "Grant access to the systems in scope and make the people doing the work available for a few hours of shadowing.",
    "02": "Review the target architecture and sign off on the decision records — this is the point to push back.",
    "03": "Nominate an engineering contact to pair on integrations and validate data contracts.",
    "04": "Show up to weekly demos and react against real data — silence here is the most expensive mistake.",
    "05": "Agree the accuracy and cost thresholds up front, then watch the shadow-mode report with us.",
    "06": "Send the team through enablement sessions and decide whether you're operating it or we are.",
  };
  return asks[number] ?? "";
}
