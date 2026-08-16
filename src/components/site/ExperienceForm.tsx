import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { createLeadFn } from "@/lib/db";
import { PostSubmitScreen } from "./PostSubmitScreen";

const experienceSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Please enter a valid phone number with country code"),
  service_interest: z.enum(["web_dev", "ai_automation", "both", "not_sure"]),
  problem_description: z.string().min(10, "Please describe the problem or workflow you want to automate"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to be contacted to experience our automation." }),
  }),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  onPickTime?: () => void;
  title?: string;
  subtitle?: string;
}

export function ExperienceForm({ onPickTime, title, subtitle }: ExperienceFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdLead, setCreatedLead] = useState<{ id?: string; name: string; phone?: string; callToken?: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setUtmParams({
        utm_source: urlParams.get("utm_source") || "",
        utm_medium: urlParams.get("utm_medium") || "",
        utm_campaign: urlParams.get("utm_campaign") || "",
        utm_content: urlParams.get("utm_content") || "",
        landing_page: window.location.pathname,
        referrer: document.referrer || "",
      });
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service_interest: "ai_automation",
      problem_description: "",
      consent: false,
    },
  });

  const onSubmit = async (data: ExperienceFormData) => {
    console.log("[EXPERIENCE FORM SUBMIT FIRED]", JSON.stringify(data, null, 2));
    setSubmitError(null);
    try {
      console.log("[EXPERIENCE FORM CALLING createLeadFn]", { source: "experience_service", name: data.name, email: data.email });
      const res = await createLeadFn({
        data: {
          source: "experience_service",
          name: data.name,
          email: data.email,
          phone: data.phone,
          service_interest: data.service_interest,
          problem_description: data.problem_description,
          consent: data.consent ?? true,
          status: "contacted",
          // Consent parameters
          internal_notes: JSON.stringify({
            consent_given: true,
            consent_timestamp: new Date().toISOString(),
            consent_text: "I agree to be contacted by House Of Workflow regarding my enquiry.",
            ...utmParams,
          }),
        },
      });
      console.log("[EXPERIENCE FORM createLeadFn SUCCESS RESULT]", res);

      setCreatedLead({
        id: (res as any)?.id || `lead-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        callToken: (res as any)?.call_token,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting lead intake form:", err);
      setSubmitError(err?.message || "Failed to submit form. Please try again.");
    }
  };

  if (isSubmitted && createdLead) {
    return (
      <PostSubmitScreen
        leadId={createdLead.id}
        leadName={createdLead.name}
        phone={createdLead.phone}
        callToken={createdLead.callToken}
        onPickTime={onPickTime || (() => { window.location.href = "/contact?tab=schedule"; })}
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-hairline bg-card p-6 sm:p-8 shadow-lift">
      <div className="mb-6">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {title || "Experience Our Service"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle || "Fill out the diagnostic form below to experience our automated lead intake & AI call flow."}
        </p>
      </div>

      {submitError && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Jay Mahajan"
            {...register("name")}
            className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="jay@houseofworkflow.com"
              {...register("email")}
              className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...register("phone")}
              className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="service_interest" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Service Interest <span className="text-destructive">*</span>
          </label>
          <select
            id="service_interest"
            {...register("service_interest")}
            className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="web_dev">Web Development & Custom Apps</option>
            <option value="ai_automation">AI Automation & Workflow Systems</option>
            <option value="both">Both Web Dev & AI Automation</option>
            <option value="not_sure">Not sure yet / Needs Diagnostic</option>
          </select>
          {errors.service_interest && <p className="mt-1 text-xs text-destructive">{errors.service_interest.message}</p>}
        </div>

        <div>
          <label htmlFor="problem_description" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Problem Description / Workflow Needs <span className="text-destructive">*</span>
          </label>
          <textarea
            id="problem_description"
            rows={3}
            placeholder="Describe the process or manual bottlenecks you want to automate..."
            {...register("problem_description")}
            className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.problem_description && <p className="mt-1 text-xs text-destructive">{errors.problem_description.message}</p>}
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-1 h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground leading-snug">
              I agree to be contacted by House Of Workflow regarding my enquiry.
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-destructive">{errors.consent.message}</p>}
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-float active:translate-y-0 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting intake...
              </>
            ) : (
              <>
                Submit &amp; Experience Automation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2 text-[0.75rem] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Your information is securely handled and used to respond to your enquiry.</span>
        </div>
      </form>
    </div>
  );
}
