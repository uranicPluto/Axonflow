import { createFileRoute } from "@tanstack/react-router";

import { ComparisonSection } from "@/components/site/ComparisonTable";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Eyebrow, MetricStrip, Reveal, Section, SectionHeader } from "@/components/site/primitives";
import { jsonLd, organizationSchema, pageMeta } from "@/components/site/seo";
import { companyFacts, principles, team } from "@/content/company";
import { comparisonPartner } from "@/content/shared";
import { brand } from "@/content/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...pageMeta({
      title: "About Axonflow — who builds the systems",
      description:
        "Axonflow is an automation and growth engineering firm founded in 2019. Meet the team, our operating principles, and how we're different from a generic AI vendor.",
      path: "/about",
    }),
    ...jsonLd(organizationSchema),
  }),
  component: About,
});

function About() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-24 sm:py-32">
          <Reveal className="max-w-2xl">
            <Eyebrow>About {brand.name}</Eyebrow>
            <h1 className="mt-6 text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              We were founded on the idea that automation should be measured, not marketed.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {brand.positioning} That means baselines before recommendations, owned code instead of black boxes,
              and a team that stays accountable to a number, not a demo.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <MetricStrip metrics={companyFacts} />
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <Reveal>
              <Eyebrow>The manifesto</Eyebrow>
              <h2 className="mt-6 text-3xl leading-[1.06] font-medium sm:text-4xl md:text-[2.6rem]">
                Most automation fails quietly, then gets blamed on the technology.
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col justify-center gap-5 text-muted-foreground">
              <p className="leading-relaxed">
                It usually fails because nobody measured the process it replaced, nobody wrote down who owns which
                decision, and nobody built the evaluation harness that would have caught the regression before a
                customer did. We started {brand.name} in {brand.founded} to do the unglamorous parts properly — the
                data contracts, the observability, the shadow-mode cutover — because that is what determines whether
                a system survives contact with a real business.
              </p>
              <p className="leading-relaxed">
                We are engineers first. We write the architecture decision records, we own the repository we hand
                you, and we would rather tell you a $200/month tool is the right answer than sell you a platform you
                don't need.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="Operating principles"
            title="What we won't compromise on, regardless of deadline or budget."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07} className="rounded-3xl border border-hairline bg-surface p-7">
                <h3 className="font-display text-lg font-medium">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader
            eyebrow="The team"
            title="Small by design, senior by necessity."
            lede="Every engagement is led by someone who has run the function you're trying to fix — not a generalist consultant reading a playbook."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <Reveal
                key={member.name}
                delay={i * 0.07}
                className="flex flex-col rounded-3xl border border-hairline bg-card p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-mono text-sm text-accent-foreground">
                  {member.initials}
                </span>
                <h3 className="mt-5 font-display text-lg font-medium">{member.name}</h3>
                <p className="mt-1 text-sm text-primary">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="How we're different"
            title="Not every problem needs a custom-built partner."
            lede="Here's the honest comparison, including where an off-the-shelf tool is genuinely the better call."
          />
          <div className="mt-14">
            <ComparisonSection data={comparisonPartner} />
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Meet the team"
        title="Talk to the people who'd actually build your system."
        body="No account executives in the room. Discovery calls are run by the engineers and operators who would lead your engagement."
      />
    </>
  );
}
