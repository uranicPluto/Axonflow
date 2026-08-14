import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getExecutiveReportFn } from "@/lib/db";
import { Cpu, RefreshCw, Trophy, Zap, ShieldAlert, Award, ArrowRight, Target, CheckCircle2, TrendingUp, DollarSign, Users, Layers, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/company-os")({
  component: CompanyOSDashboard,
});

function CompanyOSDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getExecutiveReportFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load company OS dashboard data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Autonomous Company Operating System...</div>
      </div>
    );
  }

  const domainHealthData = [
    { name: "Financial", score: data.companyHealth?.financialHealth || 93 },
    { name: "Delivery", score: data.companyHealth?.deliveryHealth || 92 },
    { name: "Revenue", score: data.companyHealth?.revenueHealth || 92 },
    { name: "Customer", score: data.companyHealth?.customerHealth || 91 },
    { name: "Growth", score: data.companyHealth?.growthHealth || 90 },
    { name: "Pipeline", score: data.companyHealth?.pipelineHealth || 88 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Autonomous Company Operating System</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Master Orchestration Layer: Domain Agents, Decision Queue, Strategic Roadmap & Executive Command</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync Company OS</span>
        </button>
      </div>

      {/* Top Company Health Banner */}
      <div className="rounded-2xl border border-[#2C4BFF]/20 bg-gradient-to-r from-[#2C4BFF]/10 via-indigo-50/50 to-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#2C4BFF]" />
            <span className="text-xs font-mono font-bold text-[#2C4BFF] uppercase tracking-wider">COMPANY HEALTH SCORECARD</span>
          </div>
          <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-xs font-bold px-3 py-1 rounded-lg">
            OVERALL SCORE: {data.companyHealth?.overallScore || 91}/100 ({data.companyHealth?.category || "Strong"})
          </span>
        </div>

        <p className="text-sm font-medium text-[#0D0D0D] leading-relaxed">
          {data.companyHealth?.summary}
        </p>

        {/* Domain Health Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {domainHealthData.map((d) => (
            <div key={d.name} className="p-3 rounded-xl bg-white border border-[#E5E4E0] space-y-0.5 text-center">
              <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">{d.name} Health</span>
              <div className="text-lg font-bold text-[#0D0D0D] font-display">{d.score} / 100</div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Health Visualizer (Recharts) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#2EA86B]" />
            DOMAIN HEALTH SCORECARD COMPARISON (0-100)
          </h3>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domainHealthData}>
              <XAxis dataKey="name" stroke="#9B9B9B" fontSize={11} />
              <YAxis stroke="#9B9B9B" fontSize={11} domain={[0, 100]} />
              <Tooltip formatter={(v: any) => [`${v}/100`, "Health Score"]} />
              <Bar dataKey="score" fill="#2C4BFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: CEO Brief & Decision Queue */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CEO Brief */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} />
              WEEKLY CEO EXECUTIVE BRIEF
            </h3>
            <span className="text-[10px] font-mono text-[#9B9B9B]">{data.ceoBrief?.briefDate}</span>
          </div>

          <p className="text-xs text-[#0D0D0D] leading-relaxed">{data.ceoBrief?.summary}</p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E5E4E0] space-y-1">
              <strong className="text-[#2EA86B]">Top Revenue Outlook:</strong>
              <p className="text-[11px] text-[#4B4B4B]">{data.ceoBrief?.revenueOutlook}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E5E4E0] space-y-1">
              <strong className="text-[#2C4BFF]">Profitability Outlook:</strong>
              <p className="text-[11px] text-[#4B4B4B]">{data.ceoBrief?.profitabilityOutlook}</p>
            </div>
          </div>
        </div>

        {/* Decision Queue */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Target size={16} className="text-[#2EA86B]" />
              PRIORITIZED DECISION QUEUE
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.decisions?.map((dec: any) => (
              <div key={dec.id} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{dec.title}</h4>
                  <span className="bg-[#2C4BFF]/10 text-[#2C4BFF] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    Priority #{dec.priority} ({dec.impact})
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B6B]">{dec.reasoning}</p>
                <div className="flex items-center justify-between text-[10px] text-[#2EA86B] font-semibold">
                  <span>Owner: {dec.owner}</span>
                  {dec.expectedRevenueImpact && <span>Lift: +${dec.expectedRevenueImpact.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Cross-Agent Collaborations & Strategic Roadmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cross-Agent Collaborations */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
              <Users size={16} />
              CROSS-AGENT COLLABORATION LAYER
            </h3>
            <span className="text-[10px] font-mono text-[#2EA86B] font-bold">Synergy Score: {data.collaborations?.crossAgentSynergyScore}/100</span>
          </div>

          <div className="space-y-3 text-xs">
            {data.collaborations?.jointRecommendations?.map((col: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C4BFF] text-[11px]">{col.participatingAgents?.join(" + ")}</span>
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    Score: {col.alignmentScore}%
                  </span>
                </div>
                <p className="text-[11px] text-[#0D0D0D] font-medium">{col.recommendation}</p>
                <p className="text-[11px] text-[#2EA86B]"><strong>Expected Impact:</strong> {col.expectedImpact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Roadmap & Objectives */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Target size={16} className="text-[#2C4BFF]" />
              STRATEGIC ROADMAP & OBJECTIVES
            </h3>
            <span className="text-[10px] font-mono text-[#2C4BFF] font-bold">{data.roadmap?.completionProgress}% Roadmap Complete</span>
          </div>

          <div className="space-y-3 text-xs">
            {data.roadmap?.objectives?.map((obj: any) => (
              <div key={obj.id} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{obj.title}</h4>
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {obj.quarter} ({obj.status})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                  <span>Target: {obj.targetValue}</span>
                  <span>Current: <strong>{obj.currentValue}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
