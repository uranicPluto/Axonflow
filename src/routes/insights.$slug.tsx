import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CtaBand } from "@/components/site/CtaBand";
import {
  ArrowRight,
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { getInsight, insights } from "@/content/insights";
import { brand } from "@/content/site";

export const Route = createFileRoute("/insights/$slug")({
  loader: ({ params }) => {
    const insight = getInsight(params.slug);
    if (!insight) throw notFound();
    return insight;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      ...pageMeta({
        title: loaderData.title,
        description: loaderData.excerpt,
        path: `/insights/${loaderData.slug}`,
      }),
      ...jsonLd({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: loaderData.title,
        description: loaderData.excerpt,
        author: { "@type": "Person", name: loaderData.author },
        datePublished: loaderData.date,
        publisher: { "@type": "Organization", name: brand.name },
        mainEntityOfPage: `${brand.url}/insights/${loaderData.slug}`,
      }),
    };
  },
  notFoundComponent: InsightNotFound,
  component: InsightArticle,
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function InsightArticle() {
  const { slug } = Route.useParams();
  const insight = getInsight(slug);
  if (!insight) return <InsightNotFound />;
  const toc = insight.body.filter((s) => s.heading);
  const related = insights.filter((i) => i.slug !== insight.slug && i.category === insight.category).slice(0, 3);
  const relatedFallback = related.length
    ? related
    : insights.filter((i) => i.slug !== insight.slug).slice(0, 3);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-16 sm:py-24">
          <Reveal>
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/insights" className="hover:text-foreground">
                Insights
              </Link>
              <span>/</span>
              <span className="text-foreground">{insight.category}</span>
            </nav>
            <Eyebrow className="mt-6">{insight.category}</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-[2.1rem] leading-[1.05] font-medium text-balance-tight sm:text-4xl md:text-[2.9rem]">
              {insight.title}
            </h1>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{insight.author}</span>
              <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
              <span>{formatDate(insight.date)}</span>
              <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden />
              <span>{insight.readTime} read</span>
            </div>
          </Reveal>
        </Container>
      </div>

      <Section className="pt-0 sm:pt-0">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[220px_1fr_260px]">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  On this page
                </p>
                <ul className="mt-4 space-y-3 border-l border-hairline pl-4">
                  {toc.map((section) => (
                    <li key={section.heading}>
                      <a
                        href={`#${slugify(section.heading!)}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className="max-w-2xl">
              <Reveal>
                <p className="text-lg leading-relaxed text-muted-foreground">{insight.excerpt}</p>
              </Reveal>
              <div className="prose-editorial mt-10 space-y-8">
                {insight.body.map((section, i) => (
                  <Reveal key={section.heading ?? i} delay={i * 0.04}>
                    {section.heading ? (
                      <h2
                        id={slugify(section.heading)}
                        className="scroll-mt-28 font-display text-xl leading-snug font-medium sm:text-2xl"
                      >
                        {section.heading}
                      </h2>
                    ) : null}
                    <div className={section.heading ? "mt-4 space-y-4" : "space-y-4"}>
                      {section.paragraphs.map((p, pi) => (
                        <p key={pi} className="text-[1.0625rem] leading-relaxed text-foreground/85">
                          {p}
                        </p>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>
            </article>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-hairline bg-secondary/50 p-6">
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  Key takeaways
                </p>
                <ul className="mt-4 space-y-3">
                  {toc.map((section) => (
                    <li key={section.heading} className="flex gap-2.5 text-sm leading-snug text-foreground/85">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                      {section.heading}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="wide">
          <p className="eyebrow">Related reading</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {relatedFallback.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.05}>
                <Link
                  to="/insights/$slug"
                  params={{ slug: r.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-card p-6 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                >
                  <div>
                    <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      {r.category}
                    </p>
                    <h3 className="mt-3 font-display text-base leading-snug font-medium">{r.title}</h3>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Read
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}

function InsightNotFound() {
  return (
    <Container size="narrow" className="py-28 text-center">
      <Eyebrow className="justify-center">Not found</Eyebrow>
      <h1 className="mt-5 font-display text-3xl font-medium">We couldn't find that article.</h1>
      <p className="mt-4 text-muted-foreground">It may have moved, or the link is out of date.</p>
      <ButtonLink to="/insights" className="mt-8">
        Back to Insights
        <ArrowRight />
      </ButtonLink>
    </Container>
  );
}
