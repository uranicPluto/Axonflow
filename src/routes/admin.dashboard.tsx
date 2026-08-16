import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeadsFn, getPostsFn, getProjectsFn, getRolesFn, getRecentActivityFn, Lead } from "@/lib/db";
import { Users, FileText, Briefcase, Plus, ChevronRight, Activity, Calendar, PhoneCall, CheckCircle2, Flame, ThermometerSun, Snowflake, ArrowRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [fetchedLeads, _, __, ___, activity] = await Promise.all([
          getLeadsFn(),
          getPostsFn(),
          getProjectsFn(),
          getRolesFn(),
          getRecentActivityFn(),
        ]);

        setLeads(fetchedLeads);
        setRecentActivity(activity.slice(0, 8));
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getServiceLabel = (srv: string | undefined) => {
    if (!srv) return "AI Automation";
    if (srv === "web_dev") return "Web Dev";
    if (srv === "ai_automation") return "AI Automation";
    if (srv === "both") return "Web & AI";
    return srv;
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case "new_lead":
      case "new":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "called":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "qualified":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "meeting_booked":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "meeting_completed":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "proposal_sent":
        return "bg-sky-500/10 text-sky-600 border-sky-500/20";
      case "won":
        return "bg-green-600/10 text-green-700 border-green-600/20";
      case "not_interested":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getScoreBadge = (score: number | undefined) => {
    const val = score ?? 70;
    if (val >= 80) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 border border-rose-200">
          <Flame size={12} className="fill-rose-500 text-rose-500" />
          {val} (Hot)
        </span>
      );
    }
    if (val >= 50) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 border border-amber-200">
          <ThermometerSun size={12} className="text-amber-500" />
          {val} (Warm)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
        <Snowflake size={12} className="text-slate-400" />
        {val} (Cold)
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading Founder Dashboard...</div>
      </div>
    );
  }

  // Funnel Metrics calculations
  const experienceFormsSubmitted = leads.length;
  const callsCompleted = leads.filter((l) => l.status !== "new" && l.status !== "new_lead").length;
  const qualifiedLeads = leads.filter((l) => (l as any).qualification_status === "qualified" || l.status === "qualified" || l.status === "meeting_booked" || l.status === "won").length;
  const meetingsBooked = leads.filter((l) => (l as any).meeting_booked || l.status === "meeting_booked" || l.meeting_confirmed).length;
  const conversionRate = experienceFormsSubmitted > 0 ? ((meetingsBooked / experienceFormsSubmitted) * 100).toFixed(1) : "0.0";

  // Qualification Breakdown calculations
  const hotLeadsCount = leads.filter((l) => (l.lead_score ?? 70) >= 80).length;
  const warmLeadsCount = leads.filter((l) => (l.lead_score ?? 70) >= 50 && (l.lead_score ?? 70) < 80).length;
  const coldLeadsCount = leads.filter((l) => (l.lead_score ?? 70) < 50).length;

  const statusFlowSteps = [
    { key: "new_lead", label: "New Lead", count: leads.filter((l) => l.status === "new_lead" || l.status === "new").length },
    { key: "called", label: "Called", count: leads.filter((l) => l.status === "called" || l.status === "contacted").length },
    { key: "qualified", label: "Qualified", count: leads.filter((l) => l.status === "qualified").length },
    { key: "meeting_booked", label: "Meeting Booked", count: leads.filter((l) => l.status === "meeting_booked" || (l as any).meeting_booked).length },
    { key: "meeting_completed", label: "Meeting Completed", count: leads.filter((l) => l.status === "meeting_completed").length },
    { key: "proposal_sent", label: "Proposal Sent", count: leads.filter((l) => l.status === "proposal_sent").length },
    { key: "won", label: "Won", count: leads.filter((l) => l.status === "won").length },
  ];

  const notInterestedCount = leads.filter((l) => l.status === "not_interested" || (l as any).qualification_status === "not_interested").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D] font-display">Founder Dashboard</h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">Workflow B — Experience Service Funnel &amp; AI Qualification Performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/experience" })}
            className="flex items-center gap-1.5 rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] transition shadow-xs"
          >
            <Users size={14} className="text-[#2C4BFF]" />
            <span>Test Form Intake</span>
          </button>
        </div>
      </div>

      {/* 1. Funnel Metrics Widget */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B9B9B] font-mono">Funnel Metrics</h2>
          <span className="text-[11px] text-[#2C4BFF] font-semibold flex items-center gap-1">
            <TrendingUp size={12} />
            {conversionRate}% Conversion Rate
          </span>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-[#E5E4E0] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#9B9B9B]">
              <span className="text-[10px] font-bold uppercase font-mono">Forms Submitted</span>
              <FileText size={16} />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0D0D0D] font-display">{experienceFormsSubmitted}</div>
            <p className="mt-1 text-[10px] text-[#6B6B6B]">Total Experience Intake</p>
          </div>

          <div className="rounded-xl border border-[#E5E4E0] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#9B9B9B]">
              <span className="text-[10px] font-bold uppercase font-mono">Calls Completed</span>
              <PhoneCall size={16} />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0D0D0D] font-display">{callsCompleted}</div>
            <p className="mt-1 text-[10px] text-[#6B6B6B]">Bolna AI Outbound Calls</p>
          </div>

          <div className="rounded-xl border border-[#E5E4E0] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#9B9B9B]">
              <span className="text-[10px] font-bold uppercase font-mono">Qualified Leads</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 font-display">{qualifiedLeads}</div>
            <p className="mt-1 text-[10px] text-[#6B6B6B]">High Intent &amp; Fit</p>
          </div>

          <div className="rounded-xl border border-[#E5E4E0] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#9B9B9B]">
              <span className="text-[10px] font-bold uppercase font-mono">Meetings Booked</span>
              <Calendar size={16} />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#2C4BFF] font-display">{meetingsBooked}</div>
            <p className="mt-1 text-[10px] text-[#6B6B6B]">Cal.com Bookings</p>
          </div>

          <div className="rounded-xl border border-[#2C4BFF]/20 bg-[#2C4BFF]/5 p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#2C4BFF]">
              <span className="text-[10px] font-bold uppercase font-mono">Conversion Rate</span>
              <TrendingUp size={16} />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#2C4BFF] font-display">{conversionRate}%</div>
            <p className="mt-1 text-[10px] text-[#2C4BFF]/80">Intake to Booked Meeting</p>
          </div>
        </div>
      </div>

      {/* 2. Qualification Breakdown Widget */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">Qualification Breakdown</h3>
            <p className="text-xs text-[#6B6B6B]">GPT Lead Score Classification across current pipeline</p>
          </div>
          <span className="text-xs font-mono text-[#9B9B9B]">{leads.length} Total Evaluated</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-mono">Hot Leads</span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">80 - 100</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-rose-900 font-display">{hotLeadsCount}</span>
              <Flame size={20} className="text-rose-500 fill-rose-500" />
            </div>
            <p className="mt-1 text-[11px] text-rose-700">Immediate decision makers with budget &amp; urgency</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">Warm Leads</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">50 - 79</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-amber-900 font-display">{warmLeadsCount}</span>
              <ThermometerSun size={20} className="text-amber-500" />
            </div>
            <p className="mt-1 text-[11px] text-amber-700">Evaluating solutions; discovery follow-up scheduled</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Cold Leads</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">0 - 49</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 font-display">{coldLeadsCount}</span>
              <Snowflake size={20} className="text-slate-400" />
            </div>
            <p className="mt-1 text-[11px] text-slate-600">Low urgency or unaligned project scope</p>
          </div>
        </div>
      </div>

      {/* 3. Status Flow Visualizer Widget */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-xs">
        <div className="border-b border-[#E5E4E0] pb-4 mb-4">
          <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">Workflow B Status Flow</h3>
          <p className="text-xs text-[#6B6B6B]">Automated pipeline progression stages from intake to close</p>
        </div>

        {/* Primary Pathway */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-[#0D0D0D]">Primary Qualification Pathway:</div>
          <div className="flex flex-wrap items-center gap-2">
            {statusFlowSteps.map((step, idx) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E4E0] bg-[#FAF9F6] px-3 py-2 min-w-[100px] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9B9B] font-mono">{step.label}</span>
                  <span className="text-sm font-bold text-[#0D0D0D] mt-0.5 font-display">{step.count}</span>
                </div>
                {idx < statusFlowSteps.length - 1 && <ArrowRight size={14} className="text-[#9B9B9B] shrink-0" />}
              </div>
            ))}
          </div>

          {/* Alternative Pathway */}
          <div className="pt-2 border-t border-dashed border-[#E5E4E0] flex items-center gap-3">
            <span className="text-xs font-semibold text-rose-600">Alternative Path:</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-[#FAF9F6] border border-[#E5E4E0] px-2 py-1 rounded font-mono text-[#6B6B6B]">new_lead</span>
              <ArrowRight size={12} className="text-[#9B9B9B]" />
              <span className="bg-[#FAF9F6] border border-[#E5E4E0] px-2 py-1 rounded font-mono text-[#6B6B6B]">called</span>
              <ArrowRight size={12} className="text-[#9B9B9B]" />
              <span className="bg-rose-50 border border-rose-200 text-rose-700 px-2 py-1 rounded font-mono font-bold">
                not_interested ({notInterestedCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lead Pipeline Widget Table */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">Lead Pipeline</h3>
            <p className="text-xs text-[#6B6B6B]">Recent leads, AI call scores, and scheduled meetings</p>
          </div>
          <Link to="/admin/leads" className="text-xs text-[#2C4BFF] hover:underline font-semibold flex items-center gap-1">
            <span>View All Leads</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E4E0] text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Lead Score</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Meeting Date</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F7F4]">
                {leads.slice(0, 8).map((lead) => {
                  const leadName = (lead as any).full_name || lead.name || "Anonymous";
                  const meetingDate = (lead as any).meeting_time || lead.meeting_datetime;
                  return (
                    <tr key={lead.id} className="hover:bg-[#F8F7F4]/60 transition">
                      <td className="py-3 font-semibold text-[#0D0D0D]">
                        <div>{leadName}</div>
                        <div className="text-[10px] font-normal text-[#9B9B9B]">{lead.email}</div>
                      </td>
                      <td className="py-3 font-mono text-[#6B6B6B]">{lead.phone || "N/A"}</td>
                      <td className="py-3">
                        <span className="bg-[#2C4BFF]/5 text-[#2C4BFF] px-2 py-0.5 rounded font-medium">
                          {getServiceLabel(lead.service_interest)}
                        </span>
                      </td>
                      <td className="py-3">{getScoreBadge(lead.lead_score)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadgeClass(lead.status)}`}>
                          {lead.status || "new_lead"}
                        </span>
                      </td>
                      <td className="py-3 text-[#6B6B6B] font-mono">{formatDate(meetingDate)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate({ to: `/admin/leads/${lead.id}` })}
                          className="text-[#2C4BFF] hover:underline font-bold"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-[#9B9B9B] italic">
            No leads recorded yet. Submit the Experience Service form to trigger the workflow.
          </div>
        )}
      </div>

      {/* Recent Activity Feed & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-4 mb-4">
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">Recent Activity Log</h3>
            <Activity size={16} className="text-[#9B9B9B]" />
          </div>
          <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs leading-normal">
                  <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[#2C4BFF]" />
                  <div className="flex-1">
                    <span className="text-[#0D0D0D] font-medium">{log.message}</span>
                    <span className="block text-[10px] text-[#9B9B9B] mt-0.5 font-mono">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#9B9B9B] italic">No recent activity recorded.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
              Quick Actions
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate({ to: "/experience" })}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] transition"
              >
                <Plus size={14} className="text-[#2C4BFF]" />
                <span>Test Lead Intake Form</span>
              </button>
              <button
                onClick={() => navigate({ to: "/admin/leads" })}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] transition"
              >
                <Users size={14} className="text-[#2C4BFF]" />
                <span>Manage All Leads</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
