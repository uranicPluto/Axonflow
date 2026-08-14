import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDealRoomIntelligenceFn, runDealExecutionAgentFn } from "@/lib/db";
import { Zap, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Flame, Clock, RefreshCw, FileText, Target, Award, Play, BookOpen, Layers } from "lucide-react";

export const Route = createFileRoute("/admin/deal-room/$id")({
  component: DealRoom,
});

function DealRoom() {
  const { id } = useParams({ from: "/admin/deal-room/$id" });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);

  const loadData = async () => {
    try {
      const res = await getDealRoomIntelligenceFn({ data: id });
      setData(res);
    } catch (err) {
      console.error("Failed to load deal room data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgent = async () => {
    try {
      setRunningAgent(true);
      await runDealExecutionAgentFn({ data: id });
      await loadData();
    } catch (err) {
      console.error("Failed to run execution agent:", err);
    } finally {
      setRunningAgent(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing AI Deal Command Center...</div>
      </div>
    );
  }

  const lead = data?.lead || {};
  const plan = data?.plan || {};
  const health = data?.health || {};
  const intent = data?.intent || {};
  const objectionPlan = data?.objectionPlan || {};
  const playbook = data?.playbook || {};
  const riskReport = data?.riskReport || {};
  const committee = data?.committee || {};
  const timeline = data?.timeline || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[#2C4BFF]/10 text-[#2C4BFF] uppercase">
              {lead.status || "NEW"} STAGE
            </span>
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">
              {lead.company_name || lead.name}'s Deal Room
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Single Source of Truth for Opportunity Execution & Autonomous Deal Driving</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/leads/${lead.id}`}
            className="text-xs text-[#6B6B6B] font-semibold hover:text-[#0D0D0D] transition px-3 py-2 border border-[#E5E4E0] rounded-xl bg-white"
          >
            &larr; Back to Lead Detail
          </Link>

          <button
            onClick={handleRunAgent}
            disabled={runningAgent}
            className="inline-flex items-center gap-2 bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Play size={14} className={runningAgent ? "animate-spin" : ""} />
            <span>Run Deal Agent</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">DEAL HEALTH</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display flex items-baseline gap-2">
            {health.score || 85}<span className="text-xs text-[#9B9B9B] font-normal">/100</span>
          </div>
          <span className="text-[11px] font-semibold text-[#2EA86B] block">Status: {health.status || "Healthy"}</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">BUYING INTENT</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display flex items-baseline gap-2">
            {intent.intentScore || 80}<span className="text-xs text-[#9B9B9B] font-normal">/100</span>
          </div>
          <span className="text-[11px] font-semibold text-[#E05555] block">Category: {intent.category || "Critical"}</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">CLOSE PROBABILITY</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display">
            {lead.close_probability || 80}%
          </div>
          <span className="text-[11px] text-[#6B6B6B] block">Est. Close: {plan.estimatedCloseDate || "14 Days"}</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">TARGET DEAL VALUE</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display">
            $7,500
          </div>
          <span className="text-[11px] text-[#6B6B6B] block">Velocity: {timeline.velocity || "High"}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deal Execution Plan */}
        <div className="lg:col-span-2 rounded-xl border border-[#2C4BFF]/30 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
              <Target size={16} />
              AUTONOMOUS DEAL EXECUTION PLAN
            </h3>
            <span className="text-[10px] font-mono text-[#2C4BFF] font-bold bg-[#2C4BFF]/10 px-2.5 py-0.5 rounded-full">
              Confidence: {plan.confidence || 85}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E5E4E0] text-xs text-[#0D0D0D] font-medium leading-relaxed">
            {plan.currentStatus}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#E05555] uppercase font-mono">Friction & Blockers</span>
              <ul className="space-y-1 text-xs text-[#0D0D0D]">
                {(plan.blockers || []).map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#E05555] font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#2EA86B] uppercase font-mono">Sales Opportunities</span>
              <ul className="space-y-1 text-xs text-[#0D0D0D]">
                {(plan.opportunities || []).map((o: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#2EA86B] font-bold">•</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E5E4E0]">
            <span className="text-[11px] font-bold text-[#2C4BFF] uppercase font-mono">Recommended Execution Steps</span>
            <div className="space-y-2">
              {(plan.nextActions || []).map((action: string, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0D0D0D]">{idx + 1}. {action}</span>
                  <span className="text-[10px] font-mono text-[#2C4BFF] font-bold bg-[#2C4BFF]/10 px-2 py-0.5 rounded">Actionable</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Objection Resolution & Rebuttals */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#F0A500] font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              OBJECTION RESOLUTION STRATEGY
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">Primary Objection</span>
              <p className="font-semibold text-[#0D0D0D] mt-0.5">"{objectionPlan.objection}"</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">Root Cause Analysis</span>
              <p className="text-[#6B6B6B] mt-0.5">{objectionPlan.rootCause}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#F0A500]/10 border border-[#F0A500]/20 space-y-1">
              <span className="text-[10px] font-bold text-[#F0A500] uppercase font-mono">Recommended Rebuttal</span>
              <p className="text-[#0D0D0D] font-medium text-[11px] leading-relaxed">{objectionPlan.responseStrategy}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">Proof & Assets</span>
              <ul className="mt-1 space-y-1 text-[11px] text-[#2C4BFF] font-semibold">
                {(objectionPlan.recommendedAssets || []).map((asset: string, i: number) => (
                  <li key={i} className="hover:underline cursor-pointer">📄 {asset}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic Sales Playbook */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-[#2C4BFF]" />
              DYNAMIC SALES PLAYBOOK
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">Core Value Positioning</span>
              <ul className="mt-1 space-y-1 text-[#0D0D0D]">
                {(playbook.messaging || []).map((m: string, i: number) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">Discovery Questions</span>
              <ul className="mt-1 space-y-1 text-[#6B6B6B] italic">
                {(playbook.discoveryQuestions || []).map((q: string, i: number) => (
                  <li key={i}>"{q}"</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Executive Buying Committee Map */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={16} className="text-[#2EA86B]" />
              BUYING COMMITTEE MAP
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {(committee.stakeholders || []).map((s: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0D0D0D]">{s.name}</p>
                  <p className="text-[11px] text-[#6B6B6B]">{s.role}</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#2EA86B]/15 text-[#2EA86B] px-2 py-0.5 rounded">
                  Influence: {s.influence_score}/100
                </span>
              </div>
            ))}

            {(committee.missingContacts || []).length > 0 && (
              <div className="p-3 rounded-lg bg-red-50/20 border border-[#E05555]/20 text-[11px]">
                <span className="font-bold text-[#E05555] block">Missing Committee Roles:</span>
                <ul className="mt-1 space-y-0.5 text-[#0D0D0D]">
                  {committee.missingContacts.map((c: string, i: number) => (
                    <li key={i}>⚠️ {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Deal Timeline & Velocity */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-[#2C4BFF]" />
              DEAL TIMELINE & MOMENTUM
            </h3>
            <span className="text-[10px] font-mono font-bold text-[#2EA86B] bg-[#2EA86B]/10 px-2 py-0.5 rounded">
              Score: {timeline.momentumScore || 85}/100
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {(timeline.events || []).map((evt: any, i: number) => (
              <div key={i} className="flex items-start gap-3 border-l-2 border-[#2C4BFF] pl-3 py-1">
                <div>
                  <p className="font-bold text-[#0D0D0D]">{evt.title}</p>
                  <p className="text-[11px] text-[#6B6B6B]">{evt.description}</p>
                  <span className="text-[10px] font-mono text-[#9B9B9B]">{new Date(evt.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
