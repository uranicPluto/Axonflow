import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

const departments = [
  {
    id: "sales",
    label: "Sales",
    trigger: "Inbound demo request",
    steps: [
      { node: "Form submitted", detail: "Website · 0.0 s" },
      { node: "Enriched & scored", detail: "Clay + signal graph · 1.2 s" },
      { node: "Routed to owner", detail: "Round-robin by territory · 4 s" },
      { node: "Meeting offered", detail: "Calendar link sent · 12 s" },
      { node: "CRM record complete", detail: "Zero rep typing · 52 s" },
    ],
    systems: ["Webflow", "Clay", "HubSpot", "Slack", "Chili Piper"],
    outcome: "52 sec median response, from 31 hours",
  },
  {
    id: "finance",
    label: "Finance",
    trigger: "Vendor invoice arrives",
    steps: [
      { node: "Document ingested", detail: "Email · OCR extraction" },
      { node: "Fields validated", detail: "Against PO and policy" },
      { node: "Coded to GL", detail: "97% straight-through" },
      { node: "Approval routed", detail: "Threshold-based" },
      { node: "Posted with lineage", detail: "Source row to figure" },
    ],
    systems: ["Ramp", "NetSuite", "Snowflake", "Slack", "dbt"],
    outcome: "3-day close, from 14 business days",
  },
  {
    id: "support",
    label: "Support",
    trigger: "Customer ticket created",
    steps: [
      { node: "Intent classified", detail: "Tier-1 category matched" },
      { node: "Version-aware retrieval", detail: "Docs scoped to firmware" },
      { node: "Tools invoked", detail: "Order lookup · diagnostics" },
      { node: "Answer or escalate", detail: "Confidence threshold" },
      { node: "Logged to audit ledger", detail: "Full reasoning trace" },
    ],
    systems: ["Zendesk", "pgvector", "Anthropic", "Linear", "Postgres"],
    outcome: "78% auto-resolved, 4 min first response",
  },
  {
    id: "people",
    label: "People",
    trigger: "Application received",
    steps: [
      { node: "Screened to rubric", detail: "Reasoning attached" },
      { node: "Bias checks logged", detail: "Auditable decisions" },
      { node: "Panel assembled", detail: "Calendars reconciled" },
      { node: "Interview booked", detail: "Rescheduling handled" },
      { node: "Onboarding triggered", detail: "On offer signature" },
    ],
    systems: ["Greenhouse", "Google Workspace", "Rippling", "Okta", "Slack"],
    outcome: "9 days faster to offer, -72% screening hours",
  },
];

export function WorkflowDemo() {
  const [active, setActive] = useState<string>("sales");
  const dept = departments.find((d) => d.id === active) ?? departments[0]!;


  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-surface">
      <div className="flex flex-wrap gap-1.5 border-b border-hairline p-4 sm:px-7">
        {departments.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActive(d.id)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm transition-colors",
              active === d.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active === d.id ? (
              <motion.span
                layoutId="workflow-tab"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative">{d.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-hairline lg:grid-cols-[1fr_320px]">
        <div className="relative bg-card p-7 sm:p-9">
          <div className="line-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">Trigger</p>
            <p className="mt-2 font-display text-lg font-medium">{dept.trigger}</p>

            <AnimatePresence mode="wait">
              <motion.ol
                key={dept.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-7 space-y-0"
              >
                {dept.steps.map((step, i) => (
                  <motion.li
                    key={step.node}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex gap-5 pb-6 last:pb-0"
                  >
                    <div className="relative flex flex-col items-center">
                      <span className="mt-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-primary/50 bg-card">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>
                      {i < dept.steps.length - 1 ? (
                        <motion.span
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.35, delay: i * 0.09 + 0.15 }}
                          style={{ originY: 0 }}
                          className="mt-1 w-px flex-1 bg-primary/25"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl border border-hairline bg-surface px-4 py-3">
                      <span className="text-sm font-medium">{step.node}</span>
                      <span className="font-mono text-[0.7rem] text-muted-foreground">{step.detail}</span>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 bg-surface p-7">
          <div>
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
              Systems in this flow
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {dept.systems.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-hairline bg-card px-3 py-1.5 text-[0.8rem] text-muted-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-primary/25 bg-accent/40 p-5">
            <p className="font-mono text-[0.7rem] tracking-widest text-accent-foreground/70 uppercase">Measured outcome</p>
            <p className="mt-2 font-display text-lg leading-snug font-medium text-accent-foreground">{dept.outcome}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
