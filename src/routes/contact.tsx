import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState, type FormEvent } from "react";

import { Container, Eyebrow, Reveal, Section } from "@/components/site/primitives";
import { Faq } from "@/components/site/Testimonials";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { serviceNav } from "@/content/site";
import { brand } from "@/content/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...pageMeta({
      title: "Contact Axonflow — book a discovery call",
      description:
        "Tell us about your team and the workflow you want to fix. We reply within one business day with next steps or a scoped discovery call.",
      path: "/contact",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Axonflow",
      url: `${brand.url}/contact`,
    }),
  }),
  component: Contact,
});

const teamSizes = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"];
const budgetRanges = ["Under $25k", "$25k–$75k", "$75k–$150k", "$150k–$300k", "$300k+", "Not sure yet"];

const faqs = [
  {
    q: "How fast will I hear back?",
    a: "Within one business day. A founder or delivery lead — not an SDR — will respond with either a scoped discovery call time or a few clarifying questions.",
  },
  {
    q: "What should I have ready for the call?",
    a: "A rough sense of the process you want to fix and who touches it today. Numbers help but aren't required — that's what the diagnostic stage is for.",
  },
  {
    q: "Do you sign NDAs before discovery?",
    a: "Yes, on request. Send it along with your message and we'll countersign before the call.",
  },
  {
    q: "Is there a minimum engagement size?",
    a: "Diagnostics start around $18k. If your need is smaller than that, we'll tell you and point you to a lighter-weight option.",
  },
];

type FormState = {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  budget: string;
  interest: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  teamSize: "",
  budget: "",
  interest: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const inputClass =
    "mt-2 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring/30";

  const errorFor = useMemo(() => errors, [errors]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid work email.";
    if (!form.company.trim()) next.company = "Please enter your company.";
    if (!form.teamSize) next.teamSize = "Select a team size.";
    if (!form.budget) next.budget = "Select a budget range.";
    if (!form.interest) next.interest = "Select an area of interest.";
    if (!form.message.trim() || form.message.trim().length < 20)
      next.message = "Tell us a little more — at least 20 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  }

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <Container size="wide" className="relative py-24 sm:py-28">
          <Reveal className="max-w-2xl">
            <Eyebrow>Get in touch</Eyebrow>
            <h1 className="mt-6 text-[2.4rem] leading-[1.02] font-medium text-balance-tight sm:text-5xl md:text-[3.4rem]">
              Tell us about the work your team shouldn't be doing.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              We read every submission ourselves. A founder or delivery lead replies within one business day —
              usually with a discovery call time.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <Reveal className="rounded-3xl border border-hairline bg-surface p-7 sm:p-9">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start py-10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none">
                      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h2 className="mt-6 font-display text-2xl font-medium">Message received.</h2>
                  <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
                    Thanks, {form.name.split(" ")[0] || "there"}. Someone from Axonflow will reply at {form.email}{" "}
                    within one business day with next steps.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(initialState);
                      setSubmitted(false);
                    }}
                    className="mt-8 text-sm font-medium text-primary underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form noValidate onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Full name
                      <input
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Jordan Reyes"
                      />
                      {errorFor.name ? <p className="mt-1.5 text-xs text-ember">{errorFor.name}</p> : null}
                    </label>
                    <label className="block text-sm font-medium">
                      Work email
                      <input
                        type="email"
                        className={inputClass}
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="jordan@company.com"
                      />
                      {errorFor.email ? <p className="mt-1.5 text-xs text-ember">{errorFor.email}</p> : null}
                    </label>
                  </div>

                  <label className="block text-sm font-medium">
                    Company
                    <input
                      className={inputClass}
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      placeholder="Company, Inc."
                    />
                    {errorFor.company ? <p className="mt-1.5 text-xs text-ember">{errorFor.company}</p> : null}
                  </label>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Team size
                      <select
                        className={inputClass}
                        value={form.teamSize}
                        onChange={(e) => update("teamSize", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {teamSizes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errorFor.teamSize ? <p className="mt-1.5 text-xs text-ember">{errorFor.teamSize}</p> : null}
                    </label>
                    <label className="block text-sm font-medium">
                      Budget range
                      <select
                        className={inputClass}
                        value={form.budget}
                        onChange={(e) => update("budget", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {budgetRanges.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      {errorFor.budget ? <p className="mt-1.5 text-xs text-ember">{errorFor.budget}</p> : null}
                    </label>
                  </div>

                  <label className="block text-sm font-medium">
                    Area of interest
                    <select
                      className={inputClass}
                      value={form.interest}
                      onChange={(e) => update("interest", e.target.value)}
                    >
                      <option value="">Select…</option>
                      {serviceNav.map((s) => (
                        <option key={s.to} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {errorFor.interest ? <p className="mt-1.5 text-xs text-ember">{errorFor.interest}</p> : null}
                  </label>

                  <label className="block text-sm font-medium">
                    What's the workflow or problem?
                    <textarea
                      className={`${inputClass} min-h-[120px] resize-y`}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Tell us who touches this process today, what's manual, and what you'd consider a win."
                    />
                    {errorFor.message ? <p className="mt-1.5 text-xs text-ember">{errorFor.message}</p> : null}
                  </label>

                  <button
                    type="submit"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
                  >
                    Send message
                  </button>
                </form>
              )}
            </Reveal>

            <Reveal delay={0.08} className="flex flex-col gap-8">
              <div className="rounded-3xl border border-hairline bg-card p-7">
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  Direct contact
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{brand.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{brand.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Office</dt>
                    <dd className="font-medium">
                      {brand.addressLines.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-3xl border border-hairline bg-card p-7">
                <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                  What to expect
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    Reply within one business day, from a founder or delivery lead.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    A 30-minute discovery call to scope the process and rough automation candidates.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    A written proposal with fixed-price phases where scope allows — no obligation to proceed.
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-hairline bg-card p-7">
                <Faq items={faqs} />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
