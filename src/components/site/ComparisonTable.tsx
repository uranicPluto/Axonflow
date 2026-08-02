import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { Reveal } from "./primitives";

type Comparison = {
  title: string;
  subtitle: string;
  columns: string[];
  rows: { label: string; a: string; b: string; highlight?: boolean }[];
  footnote: string;
};

export function ComparisonTable({ data, className }: { data: Comparison; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-hairline bg-surface", className)}>
      <div className="border-b border-hairline p-7 sm:p-9">
        <h3 className="font-display text-xl font-medium sm:text-2xl">{data.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-secondary/40">
              <th scope="col" className="w-[30%] px-7 py-4 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
                Dimension
              </th>
              <th scope="col" className="px-7 py-4 text-sm font-medium text-muted-foreground">
                {data.columns[0]}
              </th>
              <th scope="col" className="px-7 py-4 text-sm font-medium">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  {data.columns[1]}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="border-b border-hairline last:border-0"
              >
                <th scope="row" className="px-7 py-5 text-sm font-medium align-top">
                  {row.label}
                </th>
                <td className="px-7 py-5 text-sm leading-relaxed text-muted-foreground align-top">{row.a}</td>
                <td
                  className={cn(
                    "px-7 py-5 text-sm leading-relaxed align-top",
                    row.highlight ? "bg-accent/40 font-medium text-accent-foreground" : "text-foreground",
                  )}
                >
                  {row.b}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-hairline bg-secondary/40 px-7 py-5">
        <p className="text-sm text-muted-foreground italic">{data.footnote}</p>
      </div>
    </div>
  );
}

export function ComparisonSection({ data }: { data: Comparison }) {
  return (
    <Reveal>
      <ComparisonTable data={data} />
    </Reveal>
  );
}
