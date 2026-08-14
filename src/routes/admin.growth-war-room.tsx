import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getGrowthAgentFn } from "@/lib/db";
import { TrendingUp, RefreshCw, Zap, ShieldAlert, Award, Rocket, Globe, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/growth-war-room")({
  component: GrowthWarRoom,
});

function GrowthWarRoom() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getGrowthAgentFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load growth war room data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing CEO Growth War Room...</div>
      </div>
    );
  }

  const revenueImpactChart = data.topExpansionOpportunities?.map((opp: any) => ({
    name: opp.service.replace("Autonomous ", "").replace("AI ", ""),
    revenue: opp.estimatedRevenue
  })) || [
    { name: "Outbound AI SDR", revenue: 45000 },
    { name: "AI Support Agents", revenue: 35000 },
    { name: "Healthcare Intake", revenue: 60000 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Rocket className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Growth War Room</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Autonomous Market Intelligence, Competitor Threat Monitoring & Service Line Expansion</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync Strategy Room</span>
        </button>
      </div>

      {/* Top Growth Metrics Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">TOP TARGET INDUSTRY</span>
          <div className="text-xl font-bold text-[#0D0D0D] font-display mt-1">{data.topIndustries?.[0]?.industry || "Software & SaaS"}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Attractiveness: {data.topIndustries?.[0]?.score}/100</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">TOP EXPANSION SERVICE</span>
          <div className="text-xl font-bold text-[#2EA86B] font-display mt-1">Autonomous Outbound AI SDR</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Est. Lift: +$45,000</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#F0A500]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">LARGEST COMPETITOR THREAT</span>
          <div className="text-xl font-bold text-[#0D0D0D] font-display mt-1">Legacy SDR Agencies</div>
          <span className="text-[11px] text-[#F0A500] font-semibold block">Threat Score: {data.topCompetitorThreats?.[0]?.marketThreat || 42}/100</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#E05555]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">STRATEGIC ALERTS</span>
          <div className="text-3xl font-bold text-[#E05555] font-display">{data.strategicAlerts?.length || 0}</div>
          <span className="text-[11px] text-[#E05555] font-semibold block">Active executive warnings</span>
        </div>
      </div>

      {/* Grid: Industry Rankings & Competitor Threat Monitor */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Industry Opportunity Rankings */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Globe size={16} className="text-[#2C4BFF]" />
              INDUSTRY OPPORTUNITY RANKINGS
            </h3>
          </div>

          <div className="space-y-3">
            {data.topIndustries?.map((ind: any) => (
              <div key={ind.industry} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{ind.industry}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">{ind.rankTier} • Automation Demand: High</span>
                </div>
                <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[11px] font-bold px-2.5 py-1 rounded">
                  Score: {ind.score}/100
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Threat Monitor */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#F0A500] font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              COMPETITOR THREAT MONITOR
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.topCompetitorThreats?.map((comp: any) => (
              <div key={comp.competitorName} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{comp.competitorName}</h4>
                  <span className="bg-[#F0A500]/10 text-[#F0A500] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    Threat: {comp.marketThreat}/100
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B6B]"><strong>Positioning:</strong> {comp.positioning}</p>
                <div className="p-2.5 rounded bg-white border border-[#E5E4E0] text-[11px] text-[#2C4BFF] font-medium">
                  <strong>Counter Strategy:</strong> {comp.counterStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expansion Opportunities Queue */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
            <Zap size={16} />
            SERVICE EXPANSION OPPORTUNITIES QUEUE
          </h3>
          <span className="text-xs font-bold text-[#2EA86B] font-mono">Total Potential Lift: +${data.estimatedRevenueImpact?.toLocaleString()}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          {data.topExpansionOpportunities?.map((opp: any) => (
            <div key={opp.service} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-[#2C4BFF] uppercase">{opp.industry}</span>
                <h4 className="font-bold text-[#0D0D0D] text-sm">{opp.service}</h4>
                <p className="text-[11px] text-[#6B6B6B]">Launch Horizon: {opp.timeToLaunch}</p>
              </div>

              <div className="pt-2 border-t border-[#E5E4E0] flex items-center justify-between">
                <span className="text-xs font-bold text-[#2EA86B]">+${opp.estimatedRevenue?.toLocaleString()}</span>
                <button className="bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white px-3 py-1 rounded text-[10px] font-semibold transition">
                  Launch &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Impact Forecast (Recharts) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2EA86B]" />
            ESTIMATED REVENUE LIFT BY EXPANSION SERVICE ($)
          </h3>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueImpactChart}>
              <XAxis dataKey="name" stroke="#9B9B9B" fontSize={11} />
              <YAxis stroke="#9B9B9B" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Estimated Revenue"]} />
              <Bar dataKey="revenue" fill="#2EA86B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Roadmap Timeline (30-day / 90-day / 12-month) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} />
            STRATEGIC GROWTH ROADMAP (30-DAY / 90-DAY / 12-MONTH)
          </h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 text-xs">
          {data.growthPlan?.roadmap?.map((phase: any) => (
            <div key={phase.timeframe} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                <h4 className="font-bold text-[#0D0D0D] font-mono text-sm">{phase.timeframe} Roadmap</h4>
                <span className="text-xs font-bold text-[#2EA86B]">+${phase.revenueImpact?.toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">Goals</span>
                <ul className="list-disc list-inside text-[11px] text-[#0D0D0D] space-y-0.5">
                  {phase.goals?.map((g: string, idx: number) => <li key={idx}>{g}</li>)}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">Required Resources</span>
                <p className="text-[11px] text-[#6B6B6B]">{phase.resourcesRequired?.join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
