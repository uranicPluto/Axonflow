import { Link } from "@tanstack/react-router";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "default" && "max-w-[1200px]",
        size === "wide" && "max-w-[1440px]",
        size === "narrow" && "max-w-[760px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-2.5", className)}>
      <span className="inline-block h-1 w-1 rounded-full bg-primary" aria-hidden />
      {children}
    </p>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[As] as typeof motion.div;

  if (reduced) {
    return <As className={className}>{children}</As>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <div
        className={cn(
          "flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
          align === "center" && "lg:flex-col lg:items-center",
        )}
      >
        <h2 className="max-w-3xl text-3xl leading-[1.06] font-medium sm:text-4xl md:text-[2.9rem]">
          {title}
        </h2>
        {action}
      </div>
      {lede ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost" | "inverse";

const buttonBase =
  "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-lift hover:-translate-y-0.5 hover:shadow-float active:translate-y-0",
  outline:
    "border border-hairline bg-surface text-foreground hover:border-foreground/30 hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary",
  inverse:
    "bg-ink text-ink-foreground hover:-translate-y-0.5 hover:shadow-float active:translate-y-0",
};

export function ButtonLink({
  to,
  children,
  variant = "primary",
  className,
  size = "default",
  params,
}: {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  size?: "default" | "lg" | "sm";
  params?: Record<string, string>;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        size === "default" && "h-11 px-5",
        size === "lg" && "h-13 px-7 text-[0.95rem]",
        size === "sm" && "h-9 px-4 text-[0.8rem]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1",
        className,
      )}
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Animated count-up for numeric strings like "412k", "-48%", "$1.8M", "3.1x". */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  const match = value.match(/(-?[\d.,]+)/);
  const rawNumStr = match ? match[1] : null;
  const numeric = rawNumStr ? parseFloat(rawNumStr.replace(/,/g, "")) : null;

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || numeric === null || reduced) {
      setDisplay(value);
      return;
    }

    const isNegative = numeric < 0;
    const absVal = Math.abs(numeric);
    const decimals = (rawNumStr!.split(".")[1] ?? "").length;
    const duration = 1100;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentAbs = absVal * eased;

      let formattedNum: string;
      if (decimals > 0) {
        formattedNum = currentAbs.toFixed(decimals);
      } else {
        formattedNum = Math.round(currentAbs).toLocaleString();
      }

      if (formattedNum === "0" || formattedNum === "-0") {
        formattedNum = "0";
      } else if (isNegative && !formattedNum.startsWith("-")) {
        formattedNum = `-${formattedNum}`;
      }

      setDisplay(value.replace(rawNumStr!, formattedNum));

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, numeric, reduced, value, rawNumStr]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export function MetricStrip({
  metrics,
  className,
  tone = "light",
}: {
  metrics: { value: string; label: string; note?: string }[];
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2",
        metrics.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        tone === "light"
          ? "border-hairline bg-hairline"
          : "border-ink-foreground/15 bg-ink-foreground/15",
        className,
      )}
    >
      {metrics.map((m, i) => (
        <Reveal
          key={m.label}
          delay={i * 0.06}
          className={cn("p-6 sm:p-7", tone === "light" ? "bg-surface" : "bg-ink")}
        >
          <dd
            className={cn(
              "font-display text-3xl leading-none font-medium tracking-tight sm:text-[2.4rem]",
              tone === "light" ? "text-foreground" : "text-ink-foreground",
            )}
          >
            <CountUp value={m.value} />
          </dd>
          <dt
            className={cn(
              "mt-3 text-sm",
              tone === "light" ? "text-muted-foreground" : "text-ink-foreground/65",
            )}
          >
            {m.label}
          </dt>
          {m.note ? (
            <p
              className={cn(
                "mt-1 text-xs",
                tone === "light" ? "text-muted-foreground/70" : "text-ink-foreground/45",
              )}
            >
              {m.note}
            </p>
          ) : null}
        </Reveal>
      ))}
    </dl>
  );
}

export function Section({
  children,
  className,
  id,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "default" | "surface" | "ink";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 sm:py-28",
        tone === "surface" && "bg-secondary/50",
        tone === "ink" && "bg-ink text-ink-foreground",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
