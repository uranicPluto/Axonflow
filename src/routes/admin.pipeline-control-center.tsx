import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPipelineAgentFn } from "@/lib/db";
import { Target, ShieldAlert, Award, RefreshCw, Flame, UserCheck, AlertTriangle, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/pipeline-control-center")({
  component: PipelineControlCenter,
});

function PipelineControlCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPipelineAgentFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load pipeline control center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Executive Pipeline Control Center...</div>
      </div>
    );
  }

  const forecastChartData = [
    { week: "Week 1", pipeline: 45000 },
    { week: "Week 2", pipeline: 68000 },
    { week: "Week 3", pipeline: 92000 },
    { week: "Week 4", pipeline: 125000 + (data.projectedPipelineLift || 35000) }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Target className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Pipeline Control Center</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Autonomous Client Acquisition, Account Prioritization & Revenue Acceleration Command</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync Control Center</span>
        </button>
      </div>

      {/* Metrics Header Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">TOP TIER ACCOUNTS</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display">{data.topAccounts?.length || 0}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Tier 1 & 2 accounts</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">REACTIVATION TARGETS</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display">{data.reactivationTargets?.length || 0}</div>
          <span className="text-[11px] text-[#2C4BFF] font-semibold block">Resurrectable opportunities</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">SINGLE-THREADED RISKS</span>
          <div className="text-3xl font-bold text-[#E05555] font-display">{data.pipelineRisks?.length || 0}</div>
          <span className="text-[11px] text-[#E05555] font-semibold block">Multithreading action needed</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PROJECTED PIPELINE LIFT</span>
          <div className="text-3xl font-bold text-[#2EA86B] font-display">+${(data.projectedPipelineLift || 45000).toLocaleString()}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Next 30-day forecast</span>
        </div>
      </div>

      {/* Main Control Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SECTION A: Top Accounts */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-[#2C4BFF]" />
              SECTION A — TOP ACCOUNTS
            </h3>
          </div>

          <div className="space-y-3">
            {data.topAccounts?.map((item: any) => (
              <div key={item.lead.id} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#0D0D0D]">{item.lead.company_name || item.lead.name}</h4>
                  <span className="text-[10px] font-mono text-[#6B6B6B]">{item.priority?.tier} • Score: {item.priority?.score}/100</span>
                </div>
                <Link to={`/admin/deal-room/${item.lead.id}`} className="text-[#2C4BFF] font-semibold hover:underline">
                  Deal Room &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B & C: Pipeline Gaps & Reactivation Opportunities */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#E05555] font-mono uppercase tracking-wider flex items-center gap-2">
              <Flame size={16} />
              SECTION B & C — REACTIVATION QUEUE
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.reactivationTargets?.map((item: any) => (
              <div key={item.lead.id} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D]">{item.lead.name} ({item.lead.company_name || "Prospect"})</h4>
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.reactivation?.reactivationProbability}% Prob
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B6B]"><strong>Strategy:</strong> {item.reactivation?.outreachStrategy}</p>
                <p className="text-[11px] text-[#2C4BFF]"><strong>Offer:</strong> {item.reactivation?.recommendedOffer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION D & E: Champion Coverage & Single-Threaded Risks */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#F0A500] font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              SECTION D & E — COVERAGE RISKS
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.pipelineRisks?.map((item: any) => (
              <div key={item.lead.id} className="p-3.5 rounded-xl border border-[#E05555]/20 bg-[#E05555]/5 space-y-1">
                <span className="text-[10px] font-bold font-mono text-[#E05555] uppercase">SINGLE-THREADED RISK</span>
                <p className="font-bold text-[#0D0D0D]">{item.lead.company_name || item.lead.name}</p>
                <p className="text-[11px] text-[#6B6B6B]">{item.coverage?.risks?.[0]}</p>
                <span className="text-[10px] font-semibold text-[#2C4BFF] block">Missing: {item.coverage?.missingStakeholders?.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION F: Projected Pipeline Growth (Recharts Visualizer) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2EA86B]" />
            SECTION F — PROJECTED PIPELINE GROWTH FORECAST
          </h3>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastChartData}>
              <defs>
                <linearGradient id="pipelineColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EA86B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2EA86B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" stroke="#9B9B9B" fontSize={11} />
              <YAxis stroke="#9B9B9B" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Pipeline Value"]} />
              <Area type="monotone" dataKey="pipeline" stroke="#2EA86B" strokeWidth={3} fillOpacity={1} fill="url(#pipelineColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION G: Recommended Founder Actions */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={16} />
            SECTION G — RECOMMENDED FOUNDER PIPELINE ACTIONS
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          {data.recommendedActions?.map((action: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4] flex items-center justify-between">
              <span className="text-[#0D0D0D] font-medium">{action}</span>
              <button className="bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition">
                Execute &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
