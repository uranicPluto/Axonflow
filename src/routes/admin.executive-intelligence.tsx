import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRevenueOperationsFn } from "@/lib/db";
import { Trophy, RefreshCw, BarChart3, TrendingUp, DollarSign, Award, Target, FileText, Zap, CheckCircle2, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/executive-intelligence")({
  component: ExecutiveIntelligenceDashboard,
});

function ExecutiveIntelligenceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRevenueOperationsFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load executive intelligence data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Executive Intelligence Platform...</div>
      </div>
    );
  }

  const forecastAccuracyChart = data.forecastAccuracy?.historicalAccuracyTrend || [
    { period: "Month 1", accuracy: 92.5 },
    { period: "Month 2", accuracy: 94.0 },
    { period: "Month 3", accuracy: 95.2 },
    { period: "Q4 2026", accuracy: 94.5 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Trophy className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Executive Intelligence Platform</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">C-Suite Revenue Operations, Board Reporting, Forecast Accuracy & Strategic Planning</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* 1. Executive Scorecard KPIs */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">WIN RATE</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display">{data.scorecard?.winRate || 42.5}%</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">+4.2% vs prior quarter</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PIPELINE HEALTH</span>
          <div className="text-3xl font-bold text-[#2EA86B] font-display">{data.scorecard?.pipelineHealth || 88}<span className="text-xs font-normal text-[#9B9B9B]">/100</span></div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Coverage: {data.scorecard?.pipelineCoverageRatio || 3.2}x</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#F0A500]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">FORECAST ACCURACY</span>
          <div className="text-3xl font-bold text-[#F0A500] font-display">{data.forecastAccuracy?.forecastAccuracy || 94}%</div>
          <span className="text-[11px] text-[#6B6B6B] block">Reliability: {data.forecastAccuracy?.confidenceReliability}</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">SALES VELOCITY</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display">${(data.scorecard?.salesVelocity || 2500).toLocaleString()}<span className="text-xs font-normal text-[#9B9B9B]">/day</span></div>
          <span className="text-[11px] text-[#2C4BFF] font-semibold block">Avg Deal Size: ${data.scorecard?.averageDealSize?.toLocaleString()}</span>
        </div>
      </div>

      {/* Grid: Forecast Accuracy & Target Tracker */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2. Forecast Accuracy Monitor */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-[#2C4BFF]" />
              FORECAST ACCURACY MONITOR (%)
            </h3>
            <span className="text-[10px] font-mono text-[#2EA86B] font-bold">Error Rate: {data.forecastAccuracy?.errorRate}%</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastAccuracyChart}>
                <XAxis dataKey="period" stroke="#9B9B9B" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#9B9B9B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="#2C4BFF" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Revenue Target Tracker */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Target size={16} className="text-[#2EA86B]" />
              REVENUE TARGET TRACKER
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Monthly Target ($50,000)</span>
                <span>{data.targets?.monthly?.attainmentPercentage}% (${data.targets?.monthly?.actualRevenue?.toLocaleString()})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E5E4E0] overflow-hidden">
                <div className="h-full bg-[#2C4BFF] rounded-full" style={{ width: `${Math.min(100, data.targets?.monthly?.attainmentPercentage || 75)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Quarterly Target ($150,000)</span>
                <span>{data.targets?.quarterly?.attainmentPercentage}% (${data.targets?.quarterly?.actualRevenue?.toLocaleString()})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E5E4E0] overflow-hidden">
                <div className="h-full bg-[#2EA86B] rounded-full" style={{ width: `${Math.min(100, data.targets?.quarterly?.attainmentPercentage || 85)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Annual Target ($600,000)</span>
                <span>{data.targets?.annual?.attainmentPercentage}% (${data.targets?.annual?.actualRevenue?.toLocaleString()})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E5E4E0] overflow-hidden">
                <div className="h-full bg-[#F0A500] rounded-full" style={{ width: `${Math.min(100, data.targets?.annual?.attainmentPercentage || 60)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Board Report Preview */}
      <div className="rounded-xl border border-[#2C4BFF]/20 bg-gradient-to-r from-[#2C4BFF]/5 via-white to-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} />
            BOARD REPORT PREVIEW — {data.boardReport?.reportPeriod}
          </h3>
          <span className="text-[10px] font-mono bg-[#2C4BFF]/10 text-[#2C4BFF] px-2.5 py-0.5 rounded font-bold">C-SUITE DECK</span>
        </div>

        <p className="text-xs text-[#0D0D0D] leading-relaxed italic">{data.boardReport?.executiveSummary}</p>

        <div className="grid gap-4 sm:grid-cols-2 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-white border border-[#E5E4E0] space-y-1">
            <span className="text-[10px] font-bold text-[#E05555] uppercase font-mono">Strategic Risks</span>
            <ul className="list-disc list-inside text-[11px] text-[#6B6B6B] space-y-1">
              {data.boardReport?.risks?.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E4E0] space-y-1">
            <span className="text-[10px] font-bold text-[#2EA86B] uppercase font-mono">Strategic Opportunities</span>
            <ul className="list-disc list-inside text-[11px] text-[#6B6B6B] space-y-1">
              {data.boardReport?.opportunities?.map((o: string, idx: number) => <li key={idx}>{o}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Optimization Opportunities */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <Zap size={16} className="text-[#F0A500]" />
            RANKED REVENUE OPTIMIZATION RECOMMENDATIONS
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          {data.optimizations?.map((opt: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono text-[#2C4BFF] uppercase">{opt.category?.replace("_", " ")}</span>
                <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  +${opt.impactEstimate?.toLocaleString()} Impact
                </span>
              </div>
              <p className="font-bold text-[#0D0D0D]">{opt.issue}</p>
              <p className="text-[11px] text-[#6B6B6B]">{opt.recommendation}</p>
              <button className="w-full bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white py-1.5 rounded-lg text-[11px] font-semibold transition mt-1">
                {opt.action} &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Strategic Growth Planner */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={16} className="text-[#2C4BFF]" />
            STRATEGIC GROWTH PLANNER — SCENARIO MODELING
          </h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 text-xs">
          {data.growthPlan?.scenarios?.map((sc: any) => (
            <div key={sc.name} className={`p-4 rounded-xl border ${sc.name === "Expected" ? "border-[#2C4BFF] bg-[#2C4BFF]/5" : "border-[#E5E4E0] bg-white"} space-y-3`}>
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h4 className="font-bold text-[#0D0D0D] text-sm">{sc.name} Scenario</h4>
                {sc.name === "Expected" && <span className="bg-[#2C4BFF] text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">RECOMMENDED</span>}
              </div>

              <div className="space-y-1">
                <span className="text-[#6B6B6B] block">Quarterly Forecast: <strong className="text-[#0D0D0D]">${sc.quarterlyRevenue?.toLocaleString()}</strong></span>
                <span className="text-[#6B6B6B] block">Annual Projection: <strong className="text-[#0D0D0D]">${sc.annualRevenue?.toLocaleString()}</strong></span>
                <span className="text-[#6B6B6B] block">Pipeline Required: <strong className="text-[#2C4BFF]">${sc.pipelineRequired?.toLocaleString()}</strong></span>
              </div>

              <div className="pt-2 border-t border-[#E5E4E0]">
                <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">Hiring Requirements</span>
                <ul className="list-disc list-inside text-[11px] text-[#0D0D0D] pt-1 space-y-0.5">
                  {sc.hiringNeeds?.map((h: string, idx: number) => <li key={idx}>{h}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
