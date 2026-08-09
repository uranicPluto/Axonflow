import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import { Faq } from "@/components/site/Testimonials";
import {
  ArrowRight,
  ButtonLink,
  Container,
  Eyebrow,
  MetricStrip,
  Pill,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/site/primitives";
import { breadcrumbSchema, jsonLd, pageMeta } from "@/components/site/seo";
import { getService, services } from "@/content/services";
import { brand } from "@/content/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      ...pageMeta({
        title: `${loaderData.name} — ${loaderData.kicker}`,
        description: loaderData.summary,
        path: `/services/${loaderData.slug}`,
      }),
      ...jsonLd({
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: loaderData.name,
        description: loaderData.summary,
        provider: { "@type": "Organization", name: brand.name, url: brand.url },
      }),
    };
  },
  notFoundComponent: ServiceNotFound,
  component: ServiceDetail,
});

function ServiceNotFound() {
  return (
    <Section>
      <Container size="narrow" className="text-center">
        <Eyebrow>Not found</Eyebrow>
        <h1 className="mt-6 font-display text-3xl font-medium">
          We don't have a service by that name.
        </h1>
        <p className="mt-4 text-muted-foreground">Browse the full list instead.</p>
        <ButtonLink to="/services" className="mt-8" variant="outline">
          All services
        </ButtonLink>
      </Container>
    </Section>
  );
}

function ServiceDetail() {
  const { slug } = Route.useParams();
  const service = getService(slug);
  if (!service) return <ServiceNotFound />;
  const index = services.findIndex((s) => s.slug === service.slug);
  const siblings = [1, 2, 3]
    .map((offset) => services[(index + offset) % services.length])
    .filter((s): s is (typeof services)[number] => Boolean(s));

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative pt-16 pb-14 sm:pt-24 sm:pb-16">
          <Reveal>
            <nav className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
              <Link to="/services" className="hover:text-foreground">
                Services
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground">{service.name}</span>
            </nav>
            <Eyebrow className="mt-6">{service.kicker}</Eyebrow>
            <h1 className="mt-6 max-w-3xl text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              {service.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {service.summary}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/contact" size="lg">
                Book a discovery call
                <ArrowRight />
              </ButtonLink>
              <ButtonLink to="/case-studies" size="lg" variant="outline">
                See related work
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <MetricStrip metrics={service.outcomes} />
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <SectionHeader
            eyebrow="How it works"
            title="What's actually inside this engagement."
            lede="Four capability pillars we build in every version of this service, adapted to your stack."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {service.capabilities.map((c, i) => (
              <Reveal
                key={c.title}
                delay={i * 0.06}
                className="rounded-3xl border border-hairline bg-surface p-7"
              >
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-lg font-medium">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <Reveal>
              <Eyebrow>What you get</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-medium sm:text-4xl">Deliverables</h2>
              <ul className="mt-8 flex flex-col gap-4">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
                        <path
                          d="M2 6l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <Eyebrow>Under the hood</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-medium sm:text-4xl">Stack</h2>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {service.stack.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>

              <div className="mt-10 rounded-3xl border border-hairline bg-surface p-7">
                <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">
                  Engagement
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-foreground">
                  {service.engagement}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="narrow">
          <SectionHeader
            eyebrow="Questions"
            title={`${service.name}, answered directly.`}
            align="left"
          />
          <div className="mt-12">
            <Faq items={service.faqs} />
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeader eyebrow="Explore more" title="Other services worth a look." />
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {siblings.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.07}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                >
                  <div>
                    <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      {s.kicker}
                    </p>
                    <h3 className="mt-4 font-display text-lg font-medium">{s.name}</h3>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-primary">
                    Explore
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Next step"
        title={`Ready to talk about ${service.name.toLowerCase()}?`}
        body="A 30-minute discovery call, no deck. We'll come with questions about your process and leave you with a scoped first step."
      />
    </>
  );
}
