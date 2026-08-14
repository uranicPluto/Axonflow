import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/questionnaire")({
  component: PreCallQuestionnairePage,
});

function PreCallQuestionnairePage() {
  // Query params
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialEmail = searchParams.get("email") || "";
  const leadId = searchParams.get("lead_id") || "";
  const bookingId = searchParams.get("booking_id") || "";

  const [email, setEmail] = useState(initialEmail);
  const [bottleneck, setBottleneck] = useState("");
  const [techStack, setTechStack] = useState("");
  const [teamSize, setTeamSize] = useState("1-10");
  const [goal90Days, setGoal90Days] = useState("");
  const [bookingReason, setBookingReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !bottleneck || !techStack || !goal90Days || !bookingReason) {
      setErrorMsg("Please fill in all required questionnaire fields.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId || undefined,
          booking_id: bookingId || undefined,
          email,
          bottleneck,
          tech_stack: techStack,
          team_size: teamSize,
          goal_90_days: goal90Days,
          booking_reason: bookingReason,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit questionnaire");
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F3F4F6] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#2C4BFF]/10 text-[#6B82FF] px-3 py-1 rounded-full text-xs font-mono font-semibold border border-[#2C4BFF]/20">
            <Sparkles size={14} />
            <span>House Of Workflow — Pre-Call Preparation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Pre-Call Strategy Brief
          </h1>
          <p className="text-sm text-[#9CA3AF] max-w-lg mx-auto leading-relaxed">
            Please take 2 minutes to answer these 5 quick questions so our senior AI architects can prepare your personalized automation blueprint.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <CheckCircle2 size={48} className="mx-auto text-[#2EA86B]" />
            <h2 className="text-2xl font-bold text-white">Thank You!</h2>
            <p className="text-sm text-[#D1D5DB] leading-relaxed max-w-md mx-auto">
              Your questionnaire responses have been received. Our team is now generating your meeting prep brief. We look forward to speaking with you!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {errorMsg && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] p-4 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                Email Address <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#1F2937]/50 border border-[#374151] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6B82FF] focus:ring-1 focus:ring-[#6B82FF] transition"
              />
            </div>

            {/* Question 1: Bottleneck */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                1. What is your biggest business bottleneck right now? <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                placeholder="e.g., Lead follow-up takes hours, manual data entry between CRM and spreadsheets..."
                className="w-full bg-[#1F2937]/50 border border-[#374151] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6B82FF] focus:ring-1 focus:ring-[#6B82FF] transition"
              />
            </div>

            {/* Question 2: Tech Stack */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                2. What is your current tech stack? <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g., HubSpot, Zapier, PostgreSQL, Notion, Slack..."
                className="w-full bg-[#1F2937]/50 border border-[#374151] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6B82FF] focus:ring-1 focus:ring-[#6B82FF] transition"
              />
            </div>

            {/* Question 3: Team Size */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                3. What is your current team size? <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6B82FF] focus:ring-1 focus:ring-[#6B82FF] transition"
              >
                <option value="1-5">1 - 5 team members</option>
                <option value="5-20">5 - 20 team members</option>
                <option value="20-50">20 - 50 team members</option>
                <option value="50+">50+ team members</option>
              </select>
            </div>

            {/* Question 4: 90-day goal */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                4. What is your main goal in the next 90 days? <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={goal90Days}
                onChange={(e) => setGoal90Days(e.target.value)}
                placeholder="e.g., Automate customer onboarding, reduce response time to under 1 minute..."
                className="w-full bg-[#1F2937]/50 border border-[#374151] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6B82FF] focus:ring-1 focus:ring-[#6B82FF] transition"
              />
            </div>

            {/* Question 5: Why book call */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#D1D5DB] uppercase">
                5. Why did you book this call with House Of Workflow? <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                placeholder="e.g., Looking to hire an expert AI team to build custom workflows..."
                className="w-full bg-[#1F2937]/50 border border-[#374151] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6B82FF] focus:ring-1 focus:ring-[#6B82FF] transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#2C4BFF]/25 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Brief...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Strategy Answers</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#6B7280]">
          House Of Workflow © 2026 — Enterprise AI & Automation Architecture
        </div>
      </div>
    </div>
  );
}
