import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { industryNav } from "@/content/site";
import { ArrowRight } from "./primitives";

export function IndustryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-hairline bg-surface p-6 shadow-float sm:p-8 md:p-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hairline pb-6">
              <div>
                <p className="eyebrow">Solutions &amp; Industries</p>
                <h3 className="mt-2 text-2xl font-medium sm:text-3xl">Industries We Automate</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explore tailored automation workflows built for 14 core industry sectors.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-background text-sm font-medium transition-colors hover:bg-secondary"
              >
                ✕
              </button>
            </div>

            {/* Grid of 14 Industries */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industryNav.map((ind) => (
                <Link
                  key={ind.label}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={ind.to as any}
                  onClick={onClose}
                  className="group flex flex-col justify-between rounded-2xl border border-hairline bg-background p-4 transition-all duration-200 hover:border-primary/40 hover:bg-secondary/50 hover:shadow-lift"
                >
                  <div>
                    <span className="flex items-center justify-between text-sm font-medium text-foreground group-hover:text-primary">
                      {ind.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {ind.blurb}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">
                Showing all 14 industry automation sectors.
              </span>
              <Link
                to="/solutions"
                onClick={onClose}
                className="group inline-flex items-center gap-2 text-xs font-semibold text-primary"
              >
                View full Solutions &amp; Industries page
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
