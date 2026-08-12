import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Container, Eyebrow, Reveal, Section } from "@/components/site/primitives";
import { Faq } from "@/components/site/Testimonials";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { brand } from "@/content/site";
import { ExperienceForm } from "@/components/site/ExperienceForm";

declare global {
  interface Window {
    Cal?: any;
  }
}

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...pageMeta({
      title: "Contact House Of Workflow — Book a Call or Experience Service",
      description:
        "Tell us about your team and the workflow you want to fix. Experience our automated AI intake or schedule a direct call with Jay.",
      path: "/contact",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact House Of Workflow",
      url: `${brand.url}/contact`,
    }),
  }),
  component: Contact,
});

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

function Contact() {
  const [activeTab, setActiveTab] = useState<"message" | "schedule">(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("tab") === "schedule" ? "schedule" : "message";
    }
    return "message";
  });

  useEffect(() => {
    if (activeTab === "schedule" && typeof window !== "undefined") {
      (function (C: any, A: any, L: any) {
        let p = function (a: any, ar: any) { a.q.push(ar); };
        let c = C.document;
        C.Cal = C.Cal || function () {
          let a = C.Cal;
          if (!a.loaded) {
            a.loaded = true;
            a.q = [];
            let s = c.createElement("script");
            s.src = "https://embed.cal.com/embed/parent.js";
            let h = c.getElementsByTagName("head")[0];
            if (h) {
              h.appendChild(s);
            }
          }
          a.p = p;
          a.ar = arguments;
          return a;
        };
      })(window, "clean", null);

      if (window.Cal) {
        window.Cal("init", { origin: "https://cal.com" });
        window.Cal("inline", {
          elementOrSelector: "#cal-booking-widget",
          calLink: "houseofworkflow/discovery",
          config: { layout: "month_view" }
        });
        window.Cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#000000" } },
          hideEventTypeDetails: false,
          layout: "month_view"
        });
      }
    }
  }, [activeTab]);

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
              Experience our instant AI intake flow below or pick a direct time on Jay's calendar.
            </p>
          </Reveal>
        </Container>
      </div>

      <Section tone="surface">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <Reveal className="rounded-3xl border border-hairline bg-surface p-7 sm:p-9">
              <div className="mb-8 flex border-b border-hairline">
                <button
                  type="button"
                  onClick={() => setActiveTab("message")}
                  className={`pb-4 text-sm font-medium transition-colors border-b-2 pr-6 focus:outline-none cursor-pointer ${
                    activeTab === "message"
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Experience Our Service
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className={`pb-4 text-sm font-medium transition-colors border-b-2 px-6 focus:outline-none cursor-pointer ${
                    activeTab === "schedule"
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Book A Call (Cal.com)
                </button>
              </div>

              {activeTab === "schedule" ? (
                <div className="relative min-h-[600px] w-full rounded-2xl overflow-hidden bg-surface">
                  <div id="cal-booking-widget" className="h-full w-full" />
                </div>
              ) : (
                <ExperienceForm
                  onPickTime={() => setActiveTab("schedule")}
                  title="Experience Our Automation"
                  subtitle="Submit your details to experience our automated intake flow and outbound AI call options."
                />
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
