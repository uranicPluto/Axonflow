import { motion } from "motion/react";
import { Play } from "lucide-react";

export function VideoPlaceholder() {
  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-hairline bg-card p-4 shadow-float sm:p-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-hairline/60 bg-surface/90 flex flex-col items-center justify-center p-8 text-center group cursor-pointer">
        {/* Glow ambient background effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
        
        {/* Grid pattern overlay */}
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

        {/* Play Button & Content */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-glow backdrop-blur-md transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:h-24 sm:w-24"
        >
          <Play className="h-8 w-8 translate-x-0.5 fill-current sm:h-10 sm:w-10" />
        </motion.div>

        <div className="relative z-10 mt-6 max-w-md">
          <span className="rounded-full border border-hairline bg-secondary/80 px-3.5 py-1 font-mono text-[0.7rem] tracking-widest text-primary uppercase">
            Featured Video
          </span>
          <h3 className="mt-4 font-display text-xl font-medium sm:text-2xl text-foreground">
            Watch [Your Agency Name] in action
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            [ Your walkthrough video goes here ]
          </p>
        </div>
      </div>
    </div>
  );
}
