import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { brand } from "@/content/site";
import { CALCOM_EVENT_SLUG, initCalcomEmbed } from "@/lib/calcom";

export function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      initCalcomEmbed();

      if (window.Cal) {
        window.Cal("inline", {
          elementOrSelector: "#cal-booking-modal-widget",
          calLink: CALCOM_EVENT_SLUG,
          config: { layout: "month_view" },
        });
        window.Cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#6366f1" } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-[88vh] max-h-[820px] w-full max-w-[1080px] flex-col overflow-hidden rounded-[24px] border border-hairline bg-surface shadow-2xl z-10"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold tracking-tight">
                  [ <span className="font-display">{brand.name.toUpperCase()}</span>{" "}
                  <span className="text-primary">.</span> ]
                </span>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  // schedule a strategy call via Cal.com
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Cal.com Embed Widget */}
            <div className="relative flex-1 w-full overflow-y-auto bg-surface">
              <div id="cal-booking-modal-widget" className="h-full w-full min-h-[640px]" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
