import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Container, Eyebrow, Section } from "@/components/site/primitives";
import { ExperienceForm } from "@/components/site/ExperienceForm";
import { jsonLd, pageMeta } from "@/components/site/seo";
import { brand } from "@/content/site";

export const Route = createFileRoute("/experience")({
  head: () => ({
    ...pageMeta({
      title: "Experience Our Service — House Of Workflow",
      description:
        "Experience House Of Workflow's automated lead qualification and voice AI system in real time. Submit your workflow needs and test our instant response system.",
      path: "/experience",
    }),
    ...jsonLd({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Experience House Of Workflow Service",
      url: `${brand.url}/experience`,
    }),
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute -top-64 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 opacity-[0.12] blur-[120px]"
        style={{ background: "radial-gradient(ellipse, var(--color-primary), transparent 70%)" }}
        aria-hidden
      />

      <Section className="relative pt-12 sm:pt-20">
        <Container size="default">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Eyebrow>EXPERIENCE OUR AUTOMATION</Eyebrow>
              <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance-tight">
                Test our automated lead intake &amp; voice AI in action.
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
                Fill out the diagnostic form below. You can choose to receive an instant outbound call from our AI assistant <strong>Aria</strong>, or pick a direct time on Jay's calendar.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <ExperienceForm />
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
