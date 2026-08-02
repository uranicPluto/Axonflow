import { motion } from "motion/react";

import { integrationGroups } from "@/content/shared";

import { Reveal } from "./primitives";

export function EcosystemGraph() {
  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-surface">
      <div className="relative border-b border-hairline p-7 sm:p-9">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">
          <p className="eyebrow">Technology ecosystem</p>
          <h3 className="mt-3 max-w-lg font-display text-xl font-medium sm:text-2xl">
            We connect what you already own — and everything with an API.
          </h3>
        </div>
      </div>

      <div className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-5">
        {integrationGroups.map((group, gi) => (
          <div key={group.group} className="bg-surface p-6">
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">{group.group}</p>
            <ul className="mt-5 space-y-2.5">
              {group.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: gi * 0.05 + i * 0.03 }}
                  className="group flex items-center gap-2.5 text-[0.875rem]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 transition-colors group-hover:bg-primary" aria-hidden />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-secondary/40 px-7 py-5">
        <p className="text-sm text-muted-foreground">
          Plus 200+ platforms via typed adapters, webhooks, and contract-tested integrations.
        </p>
        <p className="font-mono text-[0.7rem] tracking-widest text-primary uppercase">No connector? We build it.</p>
      </div>
    </div>
  );
}

export function EcosystemSection() {
  return (
    <Reveal>
      <EcosystemGraph />
    </Reveal>
  );
}
