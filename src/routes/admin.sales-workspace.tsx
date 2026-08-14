import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeadsFn, getPendingActionsFn } from "@/lib/db";
import { Cpu, CheckCircle2, Flame, RefreshCw, Calendar, Mail, TrendingUp, ArrowRight, Award, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/sales-workspace")({
  component: SalesWorkspace,
});

function SalesWorkspace() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const l = await getLeadsFn();
      const p = await getPendingActionsFn();
      setLeads(l || []);
      setPendingActions(p || []);
    } catch (err) {
      console.error("Failed to load sales workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Autonomous Sales Workspace...</div>
      </div>
    );
  }

  const activeLeads = leads.filter((l) => l.status !== "won" && l.status !== "lost");
  const topPriorityLeads = activeLeads.slice(0, 3);
  const totalImpact = activeLeads.length * 7500;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Autonomous Sales Workspace</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Real-Time AE Command, Outreach Drafts, Meeting Booking & Deal Cadences</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync Workspace</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">ACTIVE AE DEALS</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display">{activeLeads.length}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">98% pipeline health</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PENDING APPROVALS</span>
          <div className="text-3xl font-bold text-[#F0A500] font-display">{pendingActions.length}</div>
          <Link to="/admin/approvals" className="text-[11px] text-[#2C4BFF] font-semibold hover:underline block">
            Review Approval Center &rarr;
          </Link>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">FORECASTED IMPACT</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display">${totalImpact.toLocaleString()}</div>
          <span className="text-[11px] text-[#6B6B6B] block">Target close horizon: 30d</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">CADENCE PROGRESS</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display">85%</div>
          <span className="text-[11px] text-[#2EA86B] block">Optimal touch frequency</span>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Priorities */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Flame size={16} className="text-[#E05555]" />
              TODAY'S AE PRIORITIES
            </h3>
          </div>

          <div className="space-y-3">
            {topPriorityLeads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/deal-room/${lead.id}`} className="font-bold text-[#0D0D0D] hover:text-[#2C4BFF] text-sm">
                      {lead.name} ({lead.company_name || "Prospect"})
                    </Link>
                    <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      Prob: {lead.close_probability || 80}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B]">Recommended Action: Deliver proposal walkthrough and request contract review.</p>
                </div>

                <Link
                  to={`/admin/deal-room/${lead.id}`}
                  className="bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Open Deal Room &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Outreach Drafts */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
              <Mail size={16} />
              RECOMMENDED OUTREACH DRAFTS
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-1">
              <span className="text-[10px] font-bold font-mono text-[#2C4BFF] uppercase">Proposal Reminder</span>
              <p className="font-bold text-[#0D0D0D]">Quick Question: AxonFlow Proposal Blueprint</p>
              <p className="text-[11px] text-[#6B6B6B] line-clamp-2">Following up on our custom proposal blueprint delivered earlier this week...</p>
              <Link to="/admin/approvals" className="text-[11px] text-[#2C4BFF] font-semibold hover:underline block pt-1">
                Review in Approval Center &rarr;
              </Link>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-1">
              <span className="text-[10px] font-bold font-mono text-[#F0A500] uppercase">Executive Alignment</span>
              <p className="font-bold text-[#0D0D0D]">Executive Alignment: Scaling Lead Operations</p>
              <p className="text-[11px] text-[#6B6B6B] line-clamp-2">As Founder of House Of Workflow, I wanted to reach out personally regarding our guarantees...</p>
              <Link to="/admin/approvals" className="text-[11px] text-[#2C4BFF] font-semibold hover:underline block pt-1">
                Review in Approval Center &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
