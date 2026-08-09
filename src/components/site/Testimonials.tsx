import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

import { Reveal } from "./primitives";

export function Testimonials({
  items,
}: {
  items: { text: string; name: string; role: string; company: string; initials: string }[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((t, i) => (
        <Reveal
          key={t.name}
          delay={i * 0.08}
          as="article"
          className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-7 transition-shadow duration-300 hover:shadow-lift"
        >
          <blockquote className="text-[1.0625rem] leading-relaxed text-foreground">
            "{t.text}"
          </blockquote>
          <footer className="mt-8 flex items-center gap-3 border-t border-hairline pt-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-mono text-[0.7rem] text-accent-foreground">
              {t.initials}
            </span>
            <span className="text-sm">
              <span className="block font-medium">{t.name}</span>
              <span className="block text-muted-foreground">
                {[t.role, t.company].filter(Boolean).join(", ")}
              </span>
            </span>
          </footer>
        </Reveal>
      ))}
    </div>
  );
}

export function Faq({
  items,
  className,
}: {
  items: { q: string; a: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-hairline border-y border-hairline", className)}>
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-6 py-6 text-left"
          >
            <span className="font-display text-[1.0625rem] font-medium sm:text-lg">{item.q}</span>
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-all duration-300",
                open === i && "rotate-45 border-primary/40 text-primary",
              )}
              aria-hidden
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                <path
                  d="M6 1v10M1 6h10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="max-w-2xl pr-14 pb-7 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function LogoTicker({ items, label }: { items: readonly string[]; label: string }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative">
      <p className="text-center font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-12 sm:gap-16">
          {doubled.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="font-display text-lg font-medium whitespace-nowrap text-muted-foreground/55 transition-colors hover:text-foreground sm:text-xl"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
