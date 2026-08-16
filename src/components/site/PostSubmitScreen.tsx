import { CheckCircle2, Bot, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface PostSubmitScreenProps {
  leadId?: string;
  leadName: string;
  phone?: string;
  callToken?: string;
  onPickTime?: () => void;
}

export function PostSubmitScreen({ leadName }: PostSubmitScreenProps) {
  return (
    <div className="mx-auto max-w-xl text-center py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-hairline bg-card p-8 sm:p-10 shadow-lift relative overflow-hidden text-left"
      >
        {/* Glowing Background Accent */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[400px] -translate-x-1/2 rounded-full opacity-20 blur-[90px]"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
          aria-hidden
        />

        {/* Icon Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-[0.7rem] font-mono font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              AUTOMATION INITIATED
            </div>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Thank You{leadName ? `, ${leadName}` : ""}!
            </h3>
          </div>
        </div>

        {/* Main Message */}
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
          Your request has been received successfully.
        </p>

        <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
          Our AI assistant will contact you shortly to understand your business, workflow challenges, and automation requirements.
        </p>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-muted-foreground flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary shrink-0 animate-pulse" />
          <span>
            Please keep your phone available. The qualification process will begin automatically.
          </span>
        </div>

        {/* Status Indicator Checklist */}
        <div className="mt-8 border-t border-hairline pt-6">
          <p className="font-mono text-[0.7rem] font-semibold tracking-widest text-muted-foreground uppercase mb-4">
            Live Workflow Status
          </p>

          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-surface/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
                ✓
              </div>
              <span>Request Submitted & Saved in Supabase</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-surface/60 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
                ✓
              </div>
              <span>AI Qualification Engine Triggered</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              <span>Preparing Your Outbound Call</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
