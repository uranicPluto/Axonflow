import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import {
  ArrowRight,
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
} from "@/components/site/primitives";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { getRole, roles } from "@/content/careers";
import { brand } from "@/content/site";

export const Route = createFileRoute("/careers/$slug")({
  loader: ({ params }) => {
    const role = getRole(params.slug);
    if (!role) throw notFound();
    return role;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      ...pageMeta({
        title: `${loaderData.title} — Careers`,
        description: loaderData.summary,
        path: `/careers/${loaderData.slug}`,
      }),
      ...jsonLd({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: loaderData.title,
        description: loaderData.about,
        employmentType: loaderData.type.toUpperCase().replace("-", "_"),
        hiringOrganization: { "@type": "Organization", name: brand.name, sameAs: brand.url },
        jobLocationType: loaderData.location.toLowerCase().includes("remote")
          ? "TELECOMMUTE"
          : undefined,
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: { "@type": "QuantitativeValue", value: loaderData.range },
        },
      }),
    };
  },
  notFoundComponent: RoleNotFound,
  component: RoleDetail,
});

const process = [
  "Intro call with the hiring manager",
  "A real, scoped work sample from our engagements",
  "Two team interviews — technical and judgment",
  "References, then an offer within a week",
];

function RoleDetail() {
  const { slug } = Route.useParams();
  const role = getRole(slug);
  if (!role) return <RoleNotFound />;
  const mailto = `mailto:${brand.email}?subject=${encodeURIComponent(`Application: ${role.title}`)}`;
  const otherRoles = roles.filter((r) => r.slug !== role.slug).slice(0, 3);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-16 sm:py-24">
          <Reveal>
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/careers" className="hover:text-foreground">
                Careers
              </Link>
              <span>/</span>
              <span className="text-foreground">{role.team}</span>
            </nav>
            <Eyebrow className="mt-6">{role.team}</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-[2.1rem] leading-[1.05] font-medium text-balance-tight sm:text-4xl md:text-[2.9rem]">
              {role.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {role.summary}
            </p>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-hairline pt-8">
              <div>
                <dt className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  Location
                </dt>
                <dd className="mt-2 text-sm font-medium">{role.location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  Type
                </dt>
                <dd className="mt-2 text-sm font-medium">{role.type}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  Salary
                </dt>
                <dd className="mt-2 text-sm font-medium">{role.range}</dd>
              </div>
            </dl>

            <div className="mt-9">
              <ButtonLink to={mailto} size="lg">
                Apply for this role
                <ArrowRight />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </div>

      <Section className="pt-0 sm:pt-0">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
            <article className="max-w-2xl space-y-10">
              <Reveal>
                <h2 className="font-display text-xl font-medium sm:text-2xl">About the role</h2>
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-foreground/85">
                  {role.about}
                </p>
              </Reveal>

              <Reveal delay={0.05}>
                <h2 className="font-display text-xl font-medium sm:text-2xl">Responsibilities</h2>
                <ul className="mt-4 space-y-3">
                  {role.responsibilities.map((r) => (
                    <li
                      key={r}
                      className="flex gap-2.5 text-[1.0625rem] leading-relaxed text-foreground/85"
                    >
                      <span
                        className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <h2 className="font-display text-xl font-medium sm:text-2xl">Requirements</h2>
                <ul className="mt-4 space-y-3">
                  {role.requirements.map((r) => (
                    <li
                      key={r}
                      className="flex gap-2.5 text-[1.0625rem] leading-relaxed text-foreground/85"
                    >
                      <span
                        className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {role.niceToHave.length ? (
                <Reveal delay={0.15}>
                  <h2 className="font-display text-xl font-medium sm:text-2xl">Nice to have</h2>
                  <ul className="mt-4 space-y-3">
                    {role.niceToHave.map((r) => (
                      <li
                        key={r}
                        className="flex gap-2.5 text-[1.0625rem] leading-relaxed text-foreground/85"
                      >
                        <span
                          className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary"
                          aria-hidden
                        />
                        {r}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
            </article>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-hairline bg-secondary/50 p-6">
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  Interview process
                </p>
                <ol className="mt-4 space-y-4">
                  {process.map((p, i) => (
                    <li key={p} className="flex gap-3 text-sm leading-snug text-foreground/85">
                      <span className="font-display font-medium text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {p}
                    </li>
                  ))}
                </ol>
                <ButtonLink to={mailto} className="mt-6 w-full">
                  Apply now
                  <ArrowRight />
                </ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container size="wide">
          <p className="eyebrow">Other open roles</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {otherRoles.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.05}>
                <Link
                  to="/careers/$slug"
                  params={{ slug: r.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-hairline bg-card p-6 transition-all duration-400 hover:-translate-y-1 hover:border-primary/25 hover:shadow-float"
                >
                  <div>
                    <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                      {r.team}
                    </p>
                    <h3 className="mt-3 font-display text-base leading-snug font-medium">
                      {r.title}
                    </h3>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    View role
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function RoleNotFound() {
  return (
    <Container size="narrow" className="py-28 text-center">
      <Eyebrow className="justify-center">Not found</Eyebrow>
      <h1 className="mt-5 font-display text-3xl font-medium">This role isn't open anymore.</h1>
      <p className="mt-4 text-muted-foreground">Check current openings below.</p>
      <ButtonLink to="/careers" className="mt-8">
        Back to Careers
        <ArrowRight />
      </ButtonLink>
    </Container>
  );
}
