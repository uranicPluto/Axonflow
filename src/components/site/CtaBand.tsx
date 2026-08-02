import { ArrowRight, ButtonLink, Container, Reveal } from "./primitives";

export function CtaBand({
  eyebrow = "Next step",
  title = "Let's find the work your team should stop doing.",
  body = "A 30-minute discovery call. We come with questions about your process, not a deck about ours. You leave with two or three concrete automation candidates, whether or not you hire us.",
  primaryLabel = "Book a discovery call",
  secondaryTo = "/case-studies",
  secondaryLabel = "Read case studies",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryLabel?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="line-grid absolute inset-0" />
      </div>
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
        aria-hidden
      />
      <Container className="relative py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center text-ink-foreground/50">{eyebrow}</p>
          <h2 className="mt-5 text-3xl leading-[1.05] font-medium text-balance-tight sm:text-4xl md:text-[3.25rem]">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-foreground/65 sm:text-lg">
            {body}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink to="/contact" size="lg" variant="primary">
              {primaryLabel}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              to={secondaryTo}
              size="lg"
              variant="ghost"
              className="border border-ink-foreground/20 text-ink-foreground hover:bg-ink-foreground/10"
            >
              {secondaryLabel}
            </ButtonLink>
          </div>
          <p className="mt-6 font-mono text-[0.7rem] tracking-widest text-ink-foreground/40 uppercase">
            Typical reply within one business day
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
