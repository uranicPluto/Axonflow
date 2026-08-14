import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeadFn, updateLeadStatusFn, updateLeadNotesFn, deleteLeadFn, updateLeadQualificationFn, getCommunicationLogsByLeadFn, getMeetingBriefFn, getQuestionnaireFn, getLeadEnrichmentFn, getCompanyResearchFn, getMeetingOutcomesFn, getProposalRecommendationFn, getMeetingIntelligenceFn, Lead, MeetingBrief, PreCallQuestionnaire } from "@/lib/db";
import { ArrowLeft, Mail, Phone, ExternalLink, Trash2, Copy, CheckCircle, Clock, Calendar, Flame, AlertCircle, FileText, Sparkles, HelpCircle, Briefcase, Cpu, CheckSquare, Send, Award, DollarSign, Target, UserCheck, ShieldAlert, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/leads/$id")({
  component: LeadDetail,
});

function LeadDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [commLogs, setCommLogs] = useState<any[]>([]);
  const [brief, setBrief] = useState<MeetingBrief | null>(null);
  const [questionnaire, setQuestionnaire] = useState<PreCallQuestionnaire | null>(null);
  const [enrichment, setEnrichment] = useState<any>(null);
  const [companyResearch, setCompanyResearch] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [meetingOutcomes, setMeetingOutcomes] = useState<any[]>([]);

  // Phase 11 Meeting Intelligence state
  const [meetingIntelligence, setMeetingIntelligence] = useState<any>(null);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [submittingTranscript, setSubmittingTranscript] = useState(false);

  // Meeting outcome form inputs
  const [meetingNotesInput, setMeetingNotesInput] = useState("");
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [timelineInput, setTimelineInput] = useState("");
  const [decisionMakersInput, setDecisionMakersInput] = useState("");
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);

  const [loading, setLoading] = useState(true);
  
  // Action states
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  // Override states
  const [manualScore, setManualScore] = useState<number>(0);
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [savingOverride, setSavingOverride] = useState(false);

  const loadLead = async () => {
    try {
      const data = await getLeadFn({ data: id });
      if (data) {
        setLead(data);
        setStatus(data.status);
        setNotes(data.internal_notes || "");
        setManualScore(data.lead_score || 0);
        setManualOverride(!!data.lead_score_manual_override);
        setOverrideReason(data.lead_score_override_reason || "");
      }
      const logs = await getCommunicationLogsByLeadFn({ data: id });
      setCommLogs(logs || []);

      const briefData = await getMeetingBriefFn({ data: id }).catch(() => null);
      if (briefData) setBrief(briefData);

      const qData = await getQuestionnaireFn({ data: id }).catch(() => null);
      if (qData) setQuestionnaire(qData);

      const intelData = await getMeetingIntelligenceFn({ data: id }).catch(() => null);
      if (intelData) setMeetingIntelligence(intelData);

      const enrichmentData = await getLeadEnrichmentFn({ data: id }).catch(() => null);
      if (enrichmentData) setEnrichment(enrichmentData);

      const researchData = await getCompanyResearchFn({ data: id }).catch(() => null);
      if (researchData) setCompanyResearch(researchData);

      const proposalData = await getProposalRecommendationFn({ data: id }).catch(() => null);
      if (proposalData) setProposal(proposalData);

      const outcomesData = await getMeetingOutcomesFn({ data: id }).catch(() => []);
      if (outcomesData) setMeetingOutcomes(outcomesData);
    } catch (err) {
      console.error("Failed to load lead details or meeting brief:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOutcome = async () => {
    if (!meetingNotesInput) {
      alert("Please enter discovery meeting notes");
      return;
    }
    setSubmittingOutcome(true);
    try {
      const res = await fetch("/api/admin/meeting-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: id,
          meeting_notes: meetingNotesInput,
          budget: budgetInput ? Number(budgetInput) : undefined,
          timeline: timelineInput || undefined,
          decision_makers: decisionMakersInput || undefined
        })
      });
      if (res.ok) {
        alert("Meeting outcome saved! AI proposal generated & score updated.");
        setMeetingNotesInput("");
        setBudgetInput("");
        setTimelineInput("");
        setDecisionMakersInput("");
        await loadLead();
      } else {
        alert("Failed to save outcome");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting meeting outcome");
    } finally {
      setSubmittingOutcome(false);
    }
  };

  const handleGenerateFollowUp = async (type: string) => {
    setGeneratingFollowUp(true);
    try {
      const res = await fetch("/api/admin/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: id, type })
      });
      if (res.ok) {
        alert("Follow-up email generated and logged in communication history!");
        await loadLead();
      } else {
        alert("Failed to generate follow-up");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating follow-up");
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  const handleSubmitTranscript = async () => {
    if (!transcriptInput) {
      alert("Please paste a discovery call transcript");
      return;
    }
    setSubmittingTranscript(true);
    try {
      const res = await fetch("/api/admin/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id, transcript: transcriptInput })
      });
      if (res.ok) {
        alert("Transcript processed! AI Meeting Intelligence extracted & lead score recalculated.");
        setTranscriptInput("");
        await loadLead();
      } else {
        alert("Failed to process transcript");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting transcript");
    } finally {
      setSubmittingTranscript(false);
    }
  };

  useEffect(() => {
    loadLead();
  }, [id]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      await updateLeadStatusFn({ data: { id, status } });
      await loadLead(); // reload activity log
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateLeadNotesFn({ data: { id, notes } });
      await loadLead();
    } catch (err) {
      console.error(err);
      alert("Failed to update notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveOverride = async () => {
    setSavingOverride(true);
    try {
      await updateLeadQualificationFn({
        data: {
          leadId: id,
          qualificationData: {
            lead_score: manualOverride ? Number(manualScore) : undefined,
            lead_score_manual_override: manualOverride,
            lead_score_override_reason: manualOverride ? overrideReason : ""
          }
        }
      });
      await loadLead();
      alert("Override settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save override settings: " + (err.message || err));
    } finally {
      setSavingOverride(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this lead?")) {
      try {
        await deleteLeadFn({ data: id });
        navigate({ to: "/admin/leads" });
      } catch (err) {
        console.error(err);
        alert("Failed to delete lead");
      }
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getServiceLabel = (srv: string | undefined) => {
    if (!srv) return "Not specified";
    if (srv === "web_dev") return "Web Development";
    if (srv === "ai_automation") return "AI Automation";
    if (srv === "both") return "Web Dev & AI Automation";
    return "Not sure";
  };

  const getSourceBadge = (src: string | undefined) => {
    if (src === "book_a_call") {
      return <span className="bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-bold px-2.5 py-1 rounded font-mono">Book Call</span>;
    }
    return <span className="bg-[#A06EFF]/10 text-[#A06EFF] text-xs font-bold px-2.5 py-1 rounded font-mono">Experience Form</span>;
  };

  const getStatusBadge = (st: string | undefined) => {
    switch (st) {
      case "new":
        return <span className="bg-[#E05555]/10 text-[#E05555] text-xs font-bold px-2.5 py-1 rounded">🔴 New</span>;
      case "in_progress":
        return <span className="bg-[#F0A500]/10 text-[#F0A500] text-xs font-bold px-2.5 py-1 rounded">🟡 In Progress</span>;
      case "meeting_booked":
        return <span className="bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-bold px-2.5 py-1 rounded">📅 Meeting Booked</span>;
      case "won":
        return <span className="bg-[#2EA86B]/10 text-[#2EA86B] text-xs font-bold px-2.5 py-1 rounded">✅ Won</span>;
      case "archived":
      default:
        return <span className="bg-[#9B9B9B]/10 text-[#9B9B9B] text-xs font-bold px-2.5 py-1 rounded">⬛ Archived</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-10 space-y-4">
        <AlertCircle className="mx-auto text-[#E05555]" size={40} />
        <h3 className="font-display font-bold text-lg">Lead not found</h3>
        <Link to="/admin/leads" className="text-[#3B5BDB] hover:underline text-sm font-semibold">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header back link */}
      <div>
        <Link
          to="/admin/leads"
          className="inline-flex items-center gap-1 text-xs text-[#6B6B6B] hover:text-[#3B5BDB] font-semibold transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Leads</span>
        </Link>
      </div>

      {/* Main card header */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-[#0D0D0D] tracking-tight">{lead.name}</h1>
            {lead.lead_score !== undefined && (
              <span className="flex items-center gap-1 bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-bold px-2.5 py-0.5 rounded font-mono">
                {lead.lead_score >= 70 && <Flame size={12} className="fill-current text-[#E05555]" />}
                Score: {lead.lead_score}/100
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {getSourceBadge(lead.source)}
            {getStatusBadge(lead.status)}
          </div>
        </div>
        <div className="text-[11px] text-[#9B9B9B] font-mono sm:text-right">
          Received: {formatDate(lead.created_at)}
        </div>
      </div>

      {/* 2-column detail grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — Detailed Information (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact details */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
              CONTACT DETAILS
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">EMAIL ADDRESS</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#0D0D0D]">{lead.email}</span>
                  <button
                    onClick={() => handleCopy(lead.email, "email")}
                    className="p-1 rounded hover:bg-[#F8F7F4] text-[#9B9B9B] hover:text-[#0D0D0D] transition"
                    title="Copy email"
                  >
                    <Copy size={12} />
                  </button>
                  {copiedField === "email" && <span className="text-[10px] text-[#2EA86B] font-semibold font-mono">Copied!</span>}
                </div>
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1 text-[11px] text-[#3B5BDB] hover:underline font-semibold mt-1"
                >
                  <Mail size={12} />
                  <span>Send Email</span>
                </a>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">PHONE NUMBER</span>
                {lead.phone ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#0D0D0D]">{lead.phone}</span>
                      <button
                        onClick={() => handleCopy(lead.phone || "", "phone")}
                        className="p-1 rounded hover:bg-[#F8F7F4] text-[#9B9B9B] hover:text-[#0D0D0D] transition"
                        title="Copy phone"
                      >
                        <Copy size={12} />
                      </button>
                      {copiedField === "phone" && <span className="text-[10px] text-[#2EA86B] font-semibold font-mono">Copied!</span>}
                    </div>
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-[#2EA86B] hover:underline font-semibold mt-1"
                    >
                      <Phone size={12} />
                      <span>WhatsApp Chat</span>
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-[#9B9B9B] italic">No phone number provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Project requirement */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
              WHAT THEY NEED
            </h3>
            <div>
              <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">SERVICE OF INTEREST</span>
              <p className="text-xs font-bold text-[#0D0D0D] mt-1">{getServiceLabel(lead.service_interest)}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">PROBLEM DESCRIPTION</span>
              <div className="mt-1.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 p-4 text-xs text-[#6B6B6B] leading-relaxed shadow-inner">
                {lead.problem_description || <span className="italic text-[#9B9B9B]">No description provided</span>}
              </div>
            </div>
          </div>

          {/* AI Meeting Preparation Brief */}
          {brief && (
            <div className="rounded-xl border border-[#3B5BDB]/20 bg-gradient-to-br from-white to-[#3B5BDB]/5 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h3 className="text-xs font-bold text-[#3B5BDB] font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#3B5BDB]" />
                  AI MEETING PREPARATION BRIEF
                </h3>
                <span className="text-[10px] font-mono bg-[#3B5BDB]/10 text-[#3B5BDB] font-bold px-2 py-0.5 rounded">
                  {formatDate(brief.created_at)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">RESEARCH SUMMARY</span>
                  <p className="text-xs text-[#0D0D0D] mt-1 leading-relaxed font-medium bg-white/80 p-3 rounded-lg border border-[#E5E4E0]">
                    {brief.research_summary}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">KEY PAIN POINTS</span>
                    <div className="text-xs text-[#E05555] mt-1 whitespace-pre-line bg-white/80 p-3 rounded-lg border border-[#E5E4E0]">
                      {brief.key_pain_points}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">OPPORTUNITIES</span>
                    <div className="text-xs text-[#2EA86B] mt-1 whitespace-pre-line bg-white/80 p-3 rounded-lg border border-[#E5E4E0]">
                      {brief.opportunities}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">DISCOVERY QUESTIONS</span>
                  <div className="text-xs text-[#0D0D0D] mt-1 whitespace-pre-line bg-white/80 p-3 rounded-lg border border-[#E5E4E0] font-mono">
                    {brief.discovery_questions}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">RECOMMENDED OFFER</span>
                  <p className="text-xs font-bold text-[#7950F2] mt-1 bg-[#7950F2]/10 p-3 rounded-lg border border-[#7950F2]/20">
                    {brief.recommended_offer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-Call Questionnaire Responses */}
          {questionnaire && (
            <div className="rounded-xl border border-[#7950F2]/20 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h3 className="text-xs font-bold text-[#7950F2] font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-[#7950F2]" />
                  PRE-CALL QUESTIONNAIRE RESPONSES
                </h3>
                <span className="text-[10px] font-mono text-[#9B9B9B]">
                  {formatDate(questionnaire.created_at)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">1. BIGGEST BOTTLENECK</span>
                  <p className="text-xs text-[#0D0D0D] font-medium mt-1 bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    {questionnaire.bottleneck}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">2. CURRENT TECH STACK</span>
                  <p className="text-xs text-[#0D0D0D] font-medium mt-1 bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    {questionnaire.tech_stack}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">3. TEAM SIZE</span>
                  <p className="text-xs text-[#0D0D0D] font-medium mt-1 bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    {questionnaire.team_size}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">4. 90-DAY MAIN GOAL</span>
                  <p className="text-xs text-[#0D0D0D] font-medium mt-1 bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    {questionnaire.goal_90_days}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold uppercase">5. WHY THEY BOOKED THIS CALL</span>
                  <p className="text-xs text-[#0D0D0D] font-medium mt-1 bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    {questionnaire.booking_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI qualifications (if evaluated) */}
          {(lead.lead_score !== undefined || lead.pain_points) && (
            <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
                AI CALL DETAILS
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">CALL STATUS</span>
                    <p className="text-xs font-semibold text-[#0D0D0D] mt-0.5">
                      {lead.call_answered ? "Answered ✓" : "No Answer / Unfinished ✕"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">CALL OUTCOME</span>
                    <p className="text-xs font-semibold text-[#0D0D0D] mt-0.5 capitalize">
                      {lead.call_outcome || "No call logged"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {lead.budget_signal && (
                    <div>
                      <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">BUDGET SIGNAL</span>
                      <p className="text-xs font-semibold text-[#0D0D0D] mt-0.5">{lead.budget_signal}</p>
                    </div>
                  )}
                  {lead.business_type && (
                    <div>
                      <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">BUSINESS TYPE</span>
                      <p className="text-xs font-semibold text-[#0D0D0D] mt-0.5">{lead.business_type}</p>
                    </div>
                  )}
                </div>
              </div>

              {lead.lead_score_reason && (
                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">AI SCORE EXPLANATION</span>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{lead.lead_score_reason}</p>
                </div>
              )}

              {lead.pain_points && (
                <div>
                  <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">QUALIFYING NOTES / PAIN POINTS</span>
                  <ul className="list-disc pl-5 mt-1.5 text-xs text-[#6B6B6B] space-y-1">
                    {lead.pain_points.split(",").map((point, index) => (
                      <li key={index} className="leading-relaxed">{point.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Meeting details (if booked) */}
          {lead.meeting_datetime && (
            <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
                MEETING DETAILS
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">DATE / TIME</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar size={14} className="text-[#3B5BDB]" />
                      <span className="text-xs font-semibold text-[#0D0D0D]">
                        {formatDate(lead.meeting_datetime)}
                      </span>
                    </div>
                  </div>
                  {lead.calendly_event_id && (
                    <div>
                      <span className="text-[10px] text-[#9B9B9B] font-mono font-bold">CAL.COM ID</span>
                      <p className="text-xs font-mono text-[#6B6B6B] mt-0.5">{lead.calendly_event_id}</p>
                    </div>
                  )}
                </div>

                {lead.meeting_link && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#9B9B9B] font-mono font-bold block">MEETING LINK</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#0D0D0D] max-w-[200px] truncate">
                        {lead.meeting_link}
                      </span>
                      <button
                        onClick={() => handleCopy(lead.meeting_link || "", "link")}
                        className="p-1 rounded hover:bg-[#F8F7F4] text-[#9B9B9B] hover:text-[#0D0D0D] transition"
                        title="Copy link"
                      >
                        <Copy size={12} />
                      </button>
                      {copiedField === "link" && <span className="text-[10px] text-[#2EA86B] font-semibold font-mono">Copied!</span>}
                    </div>
                    <a
                      href={`https://${lead.meeting_link.replace(/^https?:\/\//i, "")}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-[#3B5BDB] hover:underline font-semibold mt-1"
                    >
                      <ExternalLink size={12} />
                      <span>Open Link</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase 11 — AI Meeting Intelligence Card */}
          <div className="rounded-xl border border-[#2C4BFF]/30 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#2C4BFF]" />
                <h3 className="text-xs font-bold text-[#0D0D0D] font-mono tracking-wider uppercase">
                  AI MEETING INTELLIGENCE PLATFORM
                </h3>
              </div>
              {meetingIntelligence && (
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  meetingIntelligence.sentiment === "positive"
                    ? "bg-[#2EA86B]/15 text-[#2EA86B]"
                    : meetingIntelligence.sentiment === "negative"
                    ? "bg-[#E05555]/15 text-[#E05555]"
                    : "bg-[#F0A500]/15 text-[#F0A500]"
                }`}>
                  Sentiment: {meetingIntelligence.sentiment}
                </span>
              )}
            </div>

            {meetingIntelligence ? (
              <div className="space-y-4">
                {/* Executive Summary & Deal Probability Row */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">EXECUTIVE SUMMARY</span>
                    <p className="text-xs text-[#0D0D0D] leading-relaxed font-medium bg-white p-3 rounded-xl border border-[#E5E4E0]">
                      {meetingIntelligence.executive_summary}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#2C4BFF]/30 text-center space-y-1 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-[#2C4BFF] uppercase font-mono block">DEAL CLOSE PROBABILITY</span>
                    <div className="text-3xl font-bold text-[#0D0D0D] font-display">
                      {lead.close_probability || meetingIntelligence.close_probability || 75}%
                    </div>
                    <span className="text-[10px] text-[#2EA86B] font-mono font-semibold">Calculated from buying signals</span>
                  </div>
                </div>

                {/* Badge Grid: Pain Points, Business Goals, Buying Signals, Objections */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {/* Pain Points */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5E4E0] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#E05555] uppercase font-mono block">PAIN POINTS IDENTIFIED</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(meetingIntelligence.pain_points || []).map((point: string, i: number) => (
                        <span key={i} className="bg-[#E05555]/10 text-[#E05555] text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Business Goals */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5E4E0] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#2EA86B] uppercase font-mono block">DESIRED BUSINESS GOALS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(meetingIntelligence.business_goals || []).map((goal: string, i: number) => (
                        <span key={i} className="bg-[#2EA86B]/10 text-[#2EA86B] text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Buying Signals */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5E4E0] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#2C4BFF] uppercase font-mono block">KEY BUYING SIGNALS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(meetingIntelligence.buying_signals || []).map((signal: string, i: number) => (
                        <span key={i} className="bg-[#2C4BFF]/10 text-[#2C4BFF] text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                          ⚡ {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Objections */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5E4E0] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#F0A500] uppercase font-mono block">OBJECTIONS & RISKS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(meetingIntelligence.objections || []).map((obj: string, i: number) => (
                        <span key={i} className="bg-[#F0A500]/10 text-[#F0A500] text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                          ⚠️ {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stakeholders & Next Actions Checklist */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {/* Stakeholders */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5E4E0] space-y-2">
                    <span className="text-[10px] font-bold text-[#6B6B6B] uppercase font-mono block">STAKEHOLDERS IDENTIFIED</span>
                    <div className="space-y-1">
                      {(meetingIntelligence.stakeholders || []).map((st: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-[#0D0D0D]">
                          <UserCheck size={14} className="text-[#2C4BFF]" />
                          <span>{st.name || st} {st.role ? `— ${st.role}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Actions Checklist */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5E4E0] space-y-2">
                    <span className="text-[10px] font-bold text-[#6B6B6B] uppercase font-mono block">ACTION ITEMS CHECKLIST</span>
                    <div className="space-y-1">
                      {(meetingIntelligence.next_actions || []).map((act: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#0D0D0D]">
                          <CheckCircle size={14} className="text-[#2EA86B]" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9B9B9B] italic">No AI meeting intelligence generated yet for this lead.</p>
            )}

            {/* Ingest Meeting Transcript Form */}
            <div className="border-t border-[#E5E4E0] pt-4 space-y-3">
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase font-mono">
                INGEST DISCOVERY CALL TRANSCRIPT
              </label>
              <textarea
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                placeholder="Paste discovery call transcript text here (e.g. from Zoom, Fathom, Otter, or Fireflies)..."
                className="w-full h-24 p-3 border border-[#E5E4E0] rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-[#2C4BFF] focus:outline-none"
              />
              <button
                onClick={handleSubmitTranscript}
                disabled={submittingTranscript}
                className="bg-[#2C4BFF] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submittingTranscript ? "Analyzing Transcript..." : "Analyze Transcript & Extract Intelligence"}
              </button>
            </div>
          </div>

          {/* Transcript (expandable) */}
          {lead.call_transcript && (
            <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-3">
              <button
                onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                className="w-full flex items-center justify-between border-b border-[#E5E4E0] pb-2 font-mono text-xs font-bold text-[#6B6B6B] tracking-wider uppercase hover:text-[#0D0D0D] transition"
              >
                <span>CALL TRANSCRIPT</span>
                <span>{transcriptExpanded ? "Collapse ▲" : "Expand ▼"}</span>
              </button>
              {transcriptExpanded && (
                <div className="rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/40 p-4 text-[11px] leading-relaxed text-[#6B6B6B] font-mono max-h-[300px] overflow-y-auto whitespace-pre-line shadow-inner">
                  {lead.call_transcript}
                </div>
              )}
            </div>
          )}

          {/* Lead Enrichment Firmographics Card */}
          {enrichment && (
            <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h3 className="text-xs font-bold text-[#2C4BFF] font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Briefcase size={16} />
                  FIRMOGRAPHIC ENRICHMENT
                </h3>
                <span className="text-[10px] font-mono text-[#9B9B9B] bg-[#F8F7F4] px-2 py-0.5 rounded border border-[#E5E4E0]">
                  AI Auto-Enriched
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">INDUSTRY</span>
                  <span className="font-semibold text-[#0D0D0D]">{enrichment.industry}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">COMPANY SIZE</span>
                  <span className="font-semibold text-[#0D0D0D]">{enrichment.company_size} ({enrichment.employee_count} headcount)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">ESTIMATED REVENUE</span>
                  <span className="font-semibold text-[#2EA86B]">{enrichment.annual_revenue_estimate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">HEADQUARTERS</span>
                  <span className="text-[#0D0D0D]">{enrichment.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">FUNDING STAGE</span>
                  <span className="text-[#0D0D0D] font-mono">{enrichment.funding_stage}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">LINKEDIN PROFILE</span>
                  <a href={enrichment.linkedin_url} target="_blank" className="text-[#2C4BFF] hover:underline font-mono text-[11px] truncate block">
                    {enrichment.linkedin_url}
                  </a>
                </div>
              </div>
              {enrichment.tech_stack && enrichment.tech_stack.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block mb-1">DETECTED TECH STACK</span>
                  <div className="flex flex-wrap gap-1.5">
                    {enrichment.tech_stack.map((tech: string, i: number) => (
                      <span key={i} className="bg-[#2C4BFF]/10 text-[#2C4BFF] text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Company Research Agent Card */}
          {companyResearch && (
            <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h3 className="text-xs font-bold text-[#0D0D0D] font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Cpu size={16} className="text-[#2C4BFF]" />
                  AI COMPANY RESEARCH REPORT
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">EXECUTIVE COMPANY SUMMARY</span>
                  <p className="text-[#0D0D0D] mt-0.5 leading-relaxed">{companyResearch.company_summary}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    <span className="text-[10px] font-bold text-[#2EA86B] uppercase font-mono block">GROWTH SIGNALS</span>
                    <p className="text-[#0D0D0D] mt-0.5 leading-relaxed">{companyResearch.growth_signals}</p>
                  </div>
                  <div className="bg-[#F8F7F4] p-3 rounded-lg border border-[#E5E4E0]">
                    <span className="text-[10px] font-bold text-[#E05555] uppercase font-mono block">RISK & FRICTION FACTORS</span>
                    <p className="text-[#0D0D0D] mt-0.5 leading-relaxed">{companyResearch.risk_factors}</p>
                  </div>
                </div>
                <div className="bg-[#2C4BFF]/5 p-3 rounded-lg border border-[#2C4BFF]/20">
                  <span className="text-[10px] font-bold text-[#2C4BFF] uppercase font-mono block">RECOMMENDED SALES PITCH</span>
                  <p className="text-[#0D0D0D] font-medium mt-0.5 leading-relaxed">{companyResearch.recommended_pitch}</p>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Outcome Submission & History Card */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
              <h3 className="text-xs font-bold text-[#0D0D0D] font-mono tracking-wider uppercase flex items-center gap-1.5">
                <CheckSquare size={16} className="text-[#2EA86B]" />
                MEETING OUTCOME CAPTURE & PROPOSAL TRIGGER
              </h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#9B9B9B] uppercase font-mono mb-1">
                  DISCOVERY CALL NOTES & KEY TAKEAWAYS *
                </label>
                <textarea
                  value={meetingNotesInput}
                  onChange={(e) => setMeetingNotesInput(e.target.value)}
                  placeholder="Record client pain points, confirmed budget, current bottlenecks, and agreed next steps..."
                  className="w-full h-24 p-3 border border-[#E5E4E0] rounded-xl text-xs focus:ring-2 focus:ring-[#2C4BFF] focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#9B9B9B] uppercase font-mono mb-1">
                    CONFIRMED BUDGET ($)
                  </label>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full p-2 border border-[#E5E4E0] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9B9B9B] uppercase font-mono mb-1">
                    TARGET TIMELINE
                  </label>
                  <input
                    type="text"
                    value={timelineInput}
                    onChange={(e) => setTimelineInput(e.target.value)}
                    placeholder="e.g. 2 Weeks / Immediate"
                    className="w-full p-2 border border-[#E5E4E0] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9B9B9B] uppercase font-mono mb-1">
                    DECISION MAKERS
                  </label>
                  <input
                    type="text"
                    value={decisionMakersInput}
                    onChange={(e) => setDecisionMakersInput(e.target.value)}
                    placeholder="e.g. Founder + CTO"
                    className="w-full p-2 border border-[#E5E4E0] rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitOutcome}
                disabled={submittingOutcome}
                className="w-full bg-[#2C4BFF] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingOutcome ? "Processing AI Proposal & Scoring..." : "Submit Discovery Outcome & Generate AI Proposal"}
              </button>
            </div>

            {meetingOutcomes.length > 0 && (
              <div className="mt-4 border-t border-[#E5E4E0] pt-4 space-y-2">
                <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">LOGGED MEETING OUTCOMES</span>
                {meetingOutcomes.map((out: any) => (
                  <div key={out.id} className="p-3 bg-[#F8F7F4] rounded-lg border border-[#E5E4E0] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#9B9B9B]">
                      <span>{out.created_at ? formatDate(out.created_at) : "Recently"}</span>
                      <span className="text-[#2EA86B] font-bold">Score +{out.score_delta}</span>
                    </div>
                    <p className="text-[#0D0D0D] font-medium">{out.meeting_notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal Recommendation Card */}
          {proposal && (
            <div className="rounded-xl border border-[#2EA86B]/30 bg-gradient-to-r from-[#2EA86B]/5 to-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h3 className="text-xs font-bold text-[#2EA86B] font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Award size={16} />
                  AI PROPOSAL RECOMMENDATION
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#2EA86B] uppercase bg-[#2EA86B]/15 px-2 py-0.5 rounded">
                  {proposal.status}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">RECOMMENDED SERVICE PACKAGE</span>
                  <span className="font-bold text-[#0D0D0D] text-sm">{proposal.recommended_package}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">ESTIMATED PRICE RANGE</span>
                  <span className="font-bold text-[#2EA86B] text-sm">{proposal.estimated_price_range}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">IMPLEMENTATION TIMELINE</span>
                  <span className="font-semibold text-[#0D0D0D]">{proposal.implementation_timeline}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block">EXPECTED ROI</span>
                  <span className="font-semibold text-[#0D0D0D]">{proposal.expected_roi}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block mb-1">PROPOSED PROJECT SCOPE</span>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{proposal.project_scope}</p>
              </div>
              {proposal.deliverables && proposal.deliverables.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono block mb-1">TECHNICAL DELIVERABLES</span>
                  <ul className="list-disc pl-5 text-xs text-[#0D0D0D] space-y-0.5">
                    {proposal.deliverables.map((del: string, idx: number) => (
                      <li key={idx}>{del}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* AI Follow-Up Generator Card */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
              <h3 className="text-xs font-bold text-[#2C4BFF] font-mono tracking-wider uppercase flex items-center gap-1.5">
                <Send size={16} />
                AUTOMATED AI FOLLOW-UP GENERATOR
              </h3>
            </div>
            <p className="text-xs text-[#6B6B6B]">Generate tailored OpenAI sales communications directly logged into the outbound channel.</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGenerateFollowUp("recap")}
                disabled={generatingFollowUp}
                className="bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                📝 Post-Call Recap Email
              </button>
              <button
                onClick={() => handleGenerateFollowUp("proposal")}
                disabled={generatingFollowUp}
                className="bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#2C4BFF] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                💼 Proposal Presentation Email
              </button>
              <button
                onClick={() => handleGenerateFollowUp("stalled_nudge")}
                disabled={generatingFollowUp}
                className="bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#F0A500] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                ⏰ Stalled Deal Reminder
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
              COMMUNICATION HISTORY
            </h3>
            {commLogs.length === 0 ? (
              <p className="text-xs text-[#9B9B9B] italic">No communication logs recorded for this lead.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {commLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold capitalize flex items-center gap-1">
                          {log.channel === "whatsapp" && "📱 WhatsApp"}
                          {log.channel === "email" && "✉️ Email"}
                          {log.channel === "voice" && "📞 Outbound Call"}
                        </span>
                        <span className="text-[10px] text-[#9B9B9B] font-mono bg-[#E5E4E0]/40 px-1.5 py-0.5 rounded">
                          {log.provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === "sent" || log.status === "delivered" || log.status === "read"
                            ? "bg-[#2EA86B]/15 text-[#2EA86B]"
                            : log.status === "failed"
                            ? "bg-[#E05555]/15 text-[#E05555]"
                            : "bg-[#F0A500]/15 text-[#F0A500]"
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#9B9B9B] font-mono">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                    {log.template_name && (
                      <div>
                        <span className="text-[10px] text-[#9B9B9B] font-mono font-bold block">TEMPLATE USED</span>
                        <span className="font-mono text-[11px] text-[#0D0D0D]">{log.template_name}</span>
                      </div>
                    )}
                    {log.message_type && !log.template_name && (
                      <div>
                        <span className="text-[10px] text-[#9B9B9B] font-mono font-bold block">MESSAGE TYPE</span>
                        <span className="text-[11px] text-[#0D0D0D]">{log.message_type}</span>
                      </div>
                    )}
                    {log.idempotency_key && (
                      <div>
                        <span className="text-[10px] text-[#9B9B9B] font-mono font-bold block">IDEMPOTENCY KEY</span>
                        <span className="font-mono text-[10px] text-[#6B6B6B] break-all">{log.idempotency_key}</span>
                      </div>
                    )}
                    {log.error_message && (
                      <div className="bg-[#E05555]/5 border border-[#E05555]/15 p-2 rounded-lg mt-1 text-[11px] text-[#E05555]">
                        <strong>Error:</strong> {log.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Sidebar actions (1 col wide) */}
        <div className="space-y-6">
          {/* Status update box */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-2">
                STAGE FUNNEL STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              >
                <option value="new">🔴 New</option>
                <option value="in_progress">🟡 In Progress</option>
                <option value="meeting_booked">📅 Meeting Booked</option>
                <option value="won">✅ Won</option>
                <option value="archived">⬛ Archived</option>
              </select>
            </div>
            <button
              onClick={handleSaveStatus}
              disabled={savingStatus || lead.status === status}
              className="w-full rounded-xl bg-[#3B5BDB] text-white py-2 text-xs font-semibold tracking-wide hover:bg-[#2f4bc4] disabled:opacity-50 transition"
            >
              {savingStatus ? "Saving..." : "Save Status"}
            </button>
          </div>

          {/* Internal notes */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-2">
                INTERNAL ADMIN NOTES
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type private administrative notes here..."
                rows={6}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes || lead.internal_notes === notes}
              className="w-full rounded-xl border border-[#E5E4E0] bg-white text-[#0D0D0D] hover:bg-[#F8F7F4] py-2 text-xs font-semibold tracking-wide disabled:opacity-50 transition shadow-sm"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {/* Lead Scoring Override */}
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono border-b border-[#E5E4E0] pb-2">
              LEAD SCORE OVERRIDE
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#0d0d0d]">Enable Manual Override</span>
              <input
                type="checkbox"
                checked={manualOverride}
                onChange={(e) => setManualOverride(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E4E0] text-[#3B5BDB] focus:ring-[#3B5BDB]/50 cursor-pointer"
              />
            </div>

            {manualOverride && (
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase font-mono mb-1">
                    Manual Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualScore}
                    onChange={(e) => setManualScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase font-mono mb-1">
                    Override Reason
                  </label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. VIP client referral..."
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveOverride}
              disabled={savingOverride || (
                lead.lead_score_manual_override === manualOverride &&
                lead.lead_score === manualScore &&
                lead.lead_score_override_reason === overrideReason
              )}
              className="w-full rounded-xl bg-[#3B5BDB] text-white py-2 text-xs font-semibold tracking-wide hover:bg-[#2f4bc4] disabled:opacity-50 transition shadow-sm"
            >
              {savingOverride ? "Saving..." : "Save Override"}
            </button>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-[#E05555]/20 bg-white p-6 shadow-sm space-y-3">
            <h4 className="text-[10px] font-bold tracking-wider text-[#E05555] uppercase font-mono">
              DANGER ZONE
            </h4>
            <p className="text-[10px] text-[#9B9B9B]">
              Deleting this record will permanently remove all data, activity logs, and transcripts associated with this lead.
            </p>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#E05555] text-white py-2 text-xs font-semibold hover:bg-[#c94545] transition"
            >
              <Trash2 size={12} />
              <span>Delete Lead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
