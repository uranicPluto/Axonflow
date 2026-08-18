import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AuthComponent } from "@/components/ui/sign-up";
import { brand } from "@/content/site";

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container Card matching image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex w-full max-w-[850px] flex-col overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-2xl z-10 my-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-background/80 text-foreground transition-all hover:bg-accent hover:text-foreground cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="relative w-full overflow-hidden">
              <AuthComponent brandName={brand.name} showTopOverlayNav={false} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
