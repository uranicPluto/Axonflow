import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

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
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { getProjectsFn, getTestimonialsFn } from "@/lib/db";

export const Route = createFileRoute("/case-studies/")({
  loader: async () => {
    const [rawProjects, rawTestimonials] = await Promise.all([
      getProjectsFn(),
      getTestimonialsFn(),
    ]);

    const projects = rawProjects
      .filter((p) => p.published)
      .map((p) => ({
        ...p,
        industry: p.industry_tag,
        service: p.service_tag,
        summary: p.context_body.slice(0, 150) + "...",
        roi: [
          { value: p.result_1_value, label: p.result_1_label },
          { value: p.result_2_value, label: p.result_2_label },
        ].filter((r) => r.value),
      }));

    const testimonials = rawTestimonials
      .filter((t) => t.published)
      .map((t, idx) => {
        // Safe headshot avatars mapping
        const avatars = [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        ];
        return {
          text: t.quote,
          image: avatars[idx % avatars.length],
          name: t.author_name || "Anonymous",
          role: `${t.author_title || ""}${t.author_company ? `, ${t.author_company}` : ""}`,
        };
      });

    return { projects, testimonials };
  },
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
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Portfolio",
          item: "https://axonflow.com/case-studies",
        },
      ],
    }),
  }),
  component: CaseStudiesIndex,
});

function CaseStudiesIndex() {
  const { projects, testimonials } = Route.useLoaderData();

  const firstColumn = useMemo(() => testimonials.slice(0, Math.ceil(testimonials.length / 3)), [testimonials]);
  const secondColumn = useMemo(() => testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil((testimonials.length / 3) * 2)), [testimonials]);
  const thirdColumn = useMemo(() => testimonials.slice(Math.ceil((testimonials.length / 3) * 2)), [testimonials]);

  const aggregate = useMemo(
    () => [
      { value: "14", label: "Industries we work in" },
      { value: String(projects.length), label: "Case studies published" },
      { value: "100%", label: "Projects shipped on agreed scope" },
      { value: "4 wks", label: "Average time to first live system" },
    ],
    [projects],
  );

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
              Every engagement in our portfolio started with an instrumented baseline of the legacy
              workflow. That's why the numbers are this specific — they're the same numbers our
              client board saw.
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
            {projects.map((cs, i) => (
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
                    <h2 className="mt-5 font-display text-2xl leading-snug font-medium">
                      {cs.title}
                    </h2>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {cs.summary}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-6">
                      {cs.roi.slice(0, 2).map((r) => (
                        <div key={r.label}>
                          <p className="font-display text-2xl font-medium text-primary">
                            {r.value}
                          </p>
                          <p className="mt-1 text-xs leading-snug text-muted-foreground">
                            {r.label}
                          </p>
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

      {testimonials.length > 0 && (
        <Section className="overflow-hidden">
          <Container size="wide">
            <SectionHeader
              eyebrow="From the people who lived it"
              title="Not our words. Theirs."
              align="center"
            />
            <div className="flex justify-center gap-6 mt-14 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[600px] overflow-hidden relative">
              <TestimonialsColumn testimonials={firstColumn} duration={25} />
              {secondColumn.length > 0 && <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />}
              {thirdColumn.length > 0 && <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={28} />}
            </div>
          </Container>
        </Section>
      )}

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
