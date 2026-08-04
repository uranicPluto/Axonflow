import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { ArrowRight, ButtonLink, Reveal } from "./primitives";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  format: (n: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-muted-foreground" htmlFor={`roi-${label}`}>
          {label}
        </label>
        <span className="font-display text-lg font-medium">{format(value)}</span>
      </div>
      <input
        id={`roi-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow-lift [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-card"
        style={{
          background: `linear-gradient(to right, var(--color-primary) ${pct}%, var(--color-border) ${pct}%)`,
        }}
      />
    </div>
  );
}

export function RoiCalculator() {
  const [people, setPeople] = useState(6);
  const [hours, setHours] = useState(11);
  const [rate, setRate] = useState(58);

  const result = useMemo(() => {
    const weeklyHours = people * hours;
    const annualHours = weeklyHours * 46;
    const manualCost = annualHours * rate;
    const automatedShare = 0.60;
    const hoursSaved = annualHours * automatedShare;
    const savings = hoursSaved * rate;
    const buildCost = Math.round((14000 + people * 9000 + hours * 2600) / 1000) * 1000;
    const runCost = Math.round((buildCost * 0.18) / 1000) * 1000;
    const netYearOne = savings - buildCost - runCost;
    const paybackMonths = savings > 0 ? Math.max(1, (buildCost / (savings / 12)) * 1) : 0;
    return { annualHours, manualCost, hoursSaved, savings, buildCost, runCost, netYearOne, paybackMonths };
  }, [people, hours, rate]);

  const maxBar = Math.max(result.manualCost, result.buildCost + result.runCost, 1);

  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-[0.85fr_1fr]">
      <div className="space-y-8 bg-surface p-7 sm:p-9">
        <div>
          <p className="eyebrow">Live model</p>
          <h3 className="mt-3 font-display text-xl font-medium">Your inputs</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Adjust to match one function in your business. The model assumes 60% of in-scope work is automatable —
            a conservative estimate across typical automation engagements.
          </p>
        </div>
        <div className="space-y-7">
          <Slider
            label="People doing the work"
            value={people}
            min={1}
            max={40}
            step={1}
            onChange={setPeople}
            format={(n) => `${n}`}
          />
          <Slider
            label="Manual hours each, per week"
            value={hours}
            min={2}
            max={30}
            step={1}
            onChange={setHours}
            format={(n) => `${n} hrs`}
          />
          <Slider
            label="Fully loaded hourly cost"
            value={rate}
            min={25}
            max={160}
            step={1}
            onChange={setRate}
            format={(n) => `$${n}`}
          />
        </div>
        <p className="border-t border-hairline pt-5 text-xs leading-relaxed text-muted-foreground">
          Estimates only. Real engagements begin with an instrumented baseline — we measure your process before
          quoting a number.
        </p>
      </div>

      <div className="bg-card p-7 sm:p-9">
        <p className="eyebrow">Projected year one</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-display text-4xl leading-none font-medium text-primary sm:text-[3rem]">
              {currency(result.netYearOne)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Net benefit after build and run cost</p>
          </div>
          <div>
            <p className="font-display text-4xl leading-none font-medium sm:text-[3rem]">
              {Math.round(result.hoursSaved).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Hours returned to your team annually</p>
          </div>
        </div>

        <div className="mt-9 space-y-5">
          {[
            { label: "Cost of the manual process today", value: result.manualCost, tone: "ember" },
            { label: "Engineered build (one-time)", value: result.buildCost, tone: "primary" },
            { label: "Annual run and tuning", value: result.runCost, tone: "muted" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{bar.label}</span>
                <span className="font-mono text-[0.8rem]">{currency(bar.value)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className={
                    bar.tone === "ember"
                      ? "h-full rounded-full bg-ember"
                      : bar.tone === "primary"
                        ? "h-full rounded-full bg-primary"
                        : "h-full rounded-full bg-muted-foreground/40"
                  }
                  animate={{ width: `${(bar.value / maxBar) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface px-5 py-4">
          <div>
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">Payback</p>
            <p className="font-display text-xl font-medium">
              {result.paybackMonths < 1 ? "under a month" : `${result.paybackMonths.toFixed(1)} months`}
            </p>
          </div>
          <ButtonLink to="/contact" size="sm">
            Pressure-test these numbers
            <ArrowRight />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function RoiSection() {
  return (
    <Reveal>
      <RoiCalculator />
    </Reveal>
  );
}
