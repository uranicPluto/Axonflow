import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { ExperienceForm } from "./ExperienceForm";

export function ExperienceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-card border border-hairline p-1 shadow-float"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-2 sm:p-4">
            <ExperienceForm
              onPickTime={() => {
                onClose();
                window.location.href = "/contact?tab=schedule";
              }}
              title="Experience House Of Workflow"
              subtitle="Test our automated lead intake, scoring, and instant AI call system in action."
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
