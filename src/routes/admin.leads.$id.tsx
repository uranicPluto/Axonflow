import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeadFn, updateLeadStatusFn, updateLeadNotesFn, deleteLeadFn, Lead } from "@/lib/db";
import { ArrowLeft, Mail, Phone, ExternalLink, Trash2, Copy, CheckCircle, Clock, Calendar, Flame, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/leads/$id")({
  component: LeadDetail,
});

function LeadDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Action states
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  const loadLead = async () => {
    try {
      const data = await getLeadFn({ data: id });
      if (data) {
        setLead(data);
        setStatus(data.status);
        setNotes(data.internal_notes || "");
      }
    } catch (err) {
      console.error("Failed to load lead details:", err);
    } finally {
      setLoading(false);
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
                {lead.lead_score >= 8 && <Flame size={12} className="fill-current text-[#E05555]" />}
                Score: {lead.lead_score}/10
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
