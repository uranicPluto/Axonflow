import { useState } from "react";
import { ArrowRight, CheckCircle2, PhoneCall, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { requestLeadCallFn } from "@/lib/db";
import { CALCOM_EVENT_SLUG, openCalcomBookingModal } from "@/lib/calcom";

interface PostSubmitScreenProps {
  leadId?: string;
  leadName: string;
  phone?: string;
  callToken?: string;
  onPickTime: () => void;
}

export function PostSubmitScreen({ leadId, leadName, phone, callToken, onPickTime }: PostSubmitScreenProps) {
  const [callChoice, setCallChoice] = useState<"none" | "scheduled" | "error">("none");
  const [loading, setLoading] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  const handleCallMeNow = async () => {
    if (!leadId || !callToken) {
      setCallError("Unable to request call. Session token missing.");
      return;
    }
    setLoading(true);
    setCallError(null);
    try {
      await requestLeadCallFn({ data: { leadId, callToken } });
      setCallChoice("scheduled");
    } catch (err: any) {
      console.error("Failed to register call request", err);
      setCallError(err?.message || "Failed to submit call request. Please try scheduling a call instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl text-center py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-hairline bg-card p-8 shadow-lift"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          Thanks, {leadName}! We've received your message.
        </h3>
        <p className="mt-2 text-base text-muted-foreground">
          How would you like to connect with House Of Workflow?
        </p>

        {callChoice === "scheduled" ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl bg-primary/10 border border-primary/20 p-5 text-left"
          >
            <div className="flex items-start gap-3">
              <PhoneCall className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">
                  Call Request Received
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Aria will call you shortly during our available calling hours (09:00–20:00 IST). Voice automation integration will be connected in a later phase.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleCallMeNow}
              className="group flex flex-col items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-5 text-left transition-all hover:border-primary hover:bg-primary/10 active:scale-[0.98]"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Recommended</span>
              </div>
              <div className="mt-4 w-full">
                <h4 className="font-display font-semibold text-foreground text-base group-hover:text-primary">
                  Call me now
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  AI assistant <strong>Aria</strong> will call you shortly to understand your workflow needs.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-primary">
                Request Call <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                openCalcomBookingModal(CALCOM_EVENT_SLUG, { name: leadName });
                if (onPickTime) onPickTime();
              }}
              className="group flex flex-col items-center justify-between rounded-xl border border-hairline bg-background p-5 text-left transition-all hover:border-foreground/30 hover:bg-muted/30 active:scale-[0.98]"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Direct</span>
              </div>
              <div className="mt-4 w-full">
                <h4 className="font-display font-semibold text-foreground text-base group-hover:text-foreground">
                  Pick a time
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose a date and time directly on Jay's calendar via Cal.com.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-foreground">
                Open Calendar <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
