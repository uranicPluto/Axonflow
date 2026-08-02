import { useReducedMotion } from "motion/react";
import { useRef, useState, useEffect } from "react";

const legacy = [
  { label: "Request arrives in shared inbox", meta: "manual triage", tone: "warn" },
  { label: "Operator opens four systems", meta: "12 min", tone: "warn" },
  { label: "Copy-paste into spreadsheet", meta: "error-prone", tone: "bad" },
  { label: "Email chain for approval", meta: "avg 31 hrs", tone: "bad" },
  { label: "Re-key into system of record", meta: "9 min", tone: "warn" },
  { label: "Someone remembers to follow up", meta: "or doesn't", tone: "bad" },
];

const automated = [
  { label: "Request classified on arrival", meta: "0.4 s", tone: "good" },
  { label: "Context assembled from all sources", meta: "provenance kept", tone: "good" },
  { label: "Rules engine validates against policy", meta: "versioned", tone: "good" },
  { label: "Approval routed with full packet", meta: "52 s median", tone: "good" },
  { label: "Systems written back automatically", meta: "contract-tested", tone: "good" },
  { label: "Follow-up scheduled and tracked", meta: "SLA enforced", tone: "good" },
];

const toneClass: Record<string, string> = {
  bad: "text-destructive",
  warn: "text-ember",
  good: "text-primary",
};

function Column({
  title,
  caption,
  rows,
  total,
  variant,
}: {
  title: string;
  caption: string;
  rows: typeof legacy;
  total: string;
  variant: "legacy" | "auto";
}) {
  return (
    <div className="flex h-full flex-col gap-4 p-6 sm:p-8">
      <div>
        <p className="eyebrow">{variant === "legacy" ? "Before" : "After"}</p>
        <h3 className="mt-3 font-display text-xl font-medium">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{caption}</p>
      </div>
      <ol className="flex flex-1 flex-col gap-2">
        {rows.map((row, i) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-card px-4 py-3"
          >
            <span className="flex items-center gap-3 text-[0.8125rem] leading-snug">
              <span className="font-mono text-[0.65rem] text-muted-foreground/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {row.label}
            </span>
            <span className={`shrink-0 font-mono text-[0.65rem] whitespace-nowrap ${toneClass[row.tone]}`}>
              {row.meta}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex items-baseline justify-between border-t border-hairline pt-4">
        <span className="text-xs text-muted-foreground">Cycle time</span>
        <span
          className={`font-display text-2xl font-medium ${variant === "legacy" ? "text-destructive" : "text-primary"}`}
        >
          {total}
        </span>
      </div>
    </div>
  );
}

export function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(52);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();

  const move = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(92, Math.max(8, next)));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      if (typeof x === "number") move(x);
    };
    const stop = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging]);

  return (
    <div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl border border-hairline bg-secondary/40 select-none"
      >
        {/* automated (base layer) */}
        <div className="grid">
          <Column
            title="Engineered workflow"
            caption="Deterministic spine, AI at the edges, humans where judgment matters."
            rows={automated}
            total="7 min"
            variant="auto"
          />
        </div>

        {/* legacy (clipped overlay) */}
        <div
          className="absolute inset-0 bg-background"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          <div className="dot-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="relative h-full">
            <Column
              title="Legacy workflow"
              caption="Six systems, four handoffs, one person who knows how it really works."
              rows={legacy}
              total="3.2 days"
              variant="legacy"
            />
          </div>
        </div>

        {/* handle */}
        <div className="absolute inset-y-0 z-10" style={{ left: `${pct}%` }}>
          <div className="absolute inset-y-0 -left-px w-0.5 bg-primary/70" />
          <button
            type="button"
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setPct((p) => Math.max(8, p - 4));
              if (e.key === "ArrowRight") setPct((p) => Math.min(92, p + 4));
            }}
            aria-label="Drag to compare legacy and automated workflow"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={8}
            aria-valuemax={92}
            role="slider"
            tabIndex={0}
            className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-primary/40 bg-card shadow-float focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <svg viewBox="0 0 20 12" className="h-3 w-5 text-primary" fill="none" aria-hidden>
              <path d="M7 2L3 6l4 4M13 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
        {reduced ? "Use arrow keys to compare" : "Drag to compare"}
      </p>
    </div>
  );
}
