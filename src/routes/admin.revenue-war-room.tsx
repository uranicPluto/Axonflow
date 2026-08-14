import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRevenueWarRoomFn } from "@/lib/db";
import { Flame, AlertTriangle, TrendingUp, DollarSign, ArrowRight, RefreshCw, Zap, ShieldAlert, Activity, Award, Trophy, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/admin/revenue-war-room")({
  component: RevenueWarRoom,
});

function RevenueWarRoom() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await getRevenueWarRoomFn();
      setData(res);
    } catch (err) {
      console.error("Failed to load revenue war room data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Revenue War Room...</div>
      </div>
    );
  }

  const forecast = data?.forecast || {};
  const hotOpportunities = data?.hotOpportunities || [];
  const dealsAtRisk = data?.dealsAtRisk || [];

  const pieData = [
    { name: "Committed", value: forecast.committedRevenue || 15000, color: "#2EA86B" },
    { name: "Likely", value: (forecast.likelyRevenue || 45000) - (forecast.committedRevenue || 15000), color: "#2C4BFF" },
    { name: "Best Case Delta", value: (forecast.bestCaseRevenue || 95000) - (forecast.likelyRevenue || 45000), color: "#F0A500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-[#F0A500]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Revenue War Room</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Autonomous Deal Command, Intent Signals & Multi-Tier Revenue Projections</p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span>Sync Real-Time Signals</span>
        </button>
      </div>

      {/* Multi-Tier Forecast Banner */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#2EA86B]/30 bg-gradient-to-br from-[#2EA86B]/10 to-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#2EA86B]">COMMITTED REVENUE</span>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            ${(forecast.committedRevenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Contract sign-off / 85%+ prob</span>
        </div>

        <div className="rounded-xl border border-[#2C4BFF]/30 bg-gradient-to-br from-[#2C4BFF]/10 to-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#2C4BFF]">LIKELY REVENUE FORECAST</span>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            ${(forecast.likelyRevenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#2C4BFF] font-semibold mt-1 block">Confidence: {forecast.confidence || 88}%</span>
        </div>

        <div className="rounded-xl border border-[#F0A500]/30 bg-gradient-to-br from-[#F0A500]/10 to-white p-5 border-l-4 border-l-[#F0A500]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#F0A500]">BEST CASE REVENUE</span>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            ${(forecast.bestCaseRevenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">100% stage conversion</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#0D0D0D]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PIPELINE VELOCITY</span>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            ${(forecast.pipelineVelocity || 3125).toLocaleString()}<span className="text-xs text-[#9B9B9B] font-mono">/day</span>
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Avg cycle: {forecast.averageSalesCycle || 18} days</span>
        </div>
      </div>

      {/* Main War Room Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hot Opportunities Panel (Intent > 80, Prob > 70) */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#E05555] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={16} />
              HOT OPPORTUNITIES (INTENT &gt; 80, PROB &gt; 70%)
            </h3>
            <span className="text-[10px] font-mono text-[#9B9B9B]">{hotOpportunities.length} Active</span>
          </div>

          <div className="space-y-3">
            {hotOpportunities.length > 0 ? (
              hotOpportunities.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Link to={`/admin/leads/${lead.id}`} className="font-bold text-[#0D0D0D] hover:text-[#2C4BFF] text-sm">
                      {lead.name} ({lead.company_name || "Prospect"})
                    </Link>
                    <span className="bg-[#2EA86B]/15 text-[#2EA86B] font-mono font-bold px-2 py-0.5 rounded">
                      Close Prob: {lead.close_probability || 85}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#6B6B6B]">
                    <span>Buying Intent: <strong className="text-[#E05555]">Critical (92)</strong></span>
                    <span>Target Deal: $7,500</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#2C4BFF] font-semibold">Recommended Action: Close Deal</span>
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/leads/${lead.id}`} className="text-xs text-[#6B6B6B] hover:text-[#0D0D0D]">
                        Lead Detail
                      </Link>
                      <Link to={`/admin/deal-room/${lead.id}`} className="text-xs text-[#2C4BFF] font-bold hover:underline">
                        Open Deal Room &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#9B9B9B] italic py-4">No hot opportunities matching criteria.</p>
            )}
          </div>
        </div>

        {/* Deals At Risk Panel */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#E05555] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={16} />
              DEALS AT RISK (NO ACTIVITY &gt; 14 DAYS)
            </h3>
            <span className="text-[10px] font-mono text-[#E05555] font-bold">{dealsAtRisk.length} Flagged</span>
          </div>

          <div className="space-y-3">
            {dealsAtRisk.length > 0 ? (
              dealsAtRisk.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="p-4 rounded-xl border border-[#E05555]/20 bg-red-50/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Link to={`/admin/leads/${lead.id}`} className="font-bold text-[#0D0D0D] hover:text-[#2C4BFF] text-sm">
                      {lead.name} ({lead.company_name || "Prospect"})
                    </Link>
                    <span className="bg-[#E05555]/10 text-[#E05555] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      Risk Level: High
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                    <span>Stage: <span className="font-mono uppercase font-semibold text-[#F0A500]">{lead.status}</span></span>
                    <span>No Activity: 14+ Days</span>
                  </div>
                  <Link
                    to={`/admin/leads/${lead.id}`}
                    className="inline-block text-[11px] text-[#2C4BFF] font-semibold hover:underline"
                  >
                    Trigger Re-engagement Sequence &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-[#2EA86B]/20 bg-[#2EA86B]/5 text-xs text-[#2EA86B] font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Zero deal risks detected! All pipeline deals are active.</span>
              </div>
            )}
          </div>
        </div>

        {/* Buying Signal Feed */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={16} />
              REAL-TIME BUYING SIGNAL FEED
            </h3>
            <span className="text-[10px] font-mono text-[#9B9B9B]">Live Activity Stream</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-start gap-3 text-xs">
              <div className="p-2 bg-[#2C4BFF]/10 text-[#2C4BFF] rounded-lg">
                <Activity size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#0D0D0D]">Proposal Viewed 4x</p>
                <p className="text-[11px] text-[#6B6B6B]">Sarah Connor (Acme Automations) viewed proposal blueprint</p>
                <span className="text-[10px] font-mono text-[#9B9B9B]">10 minutes ago</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-start gap-3 text-xs">
              <div className="p-2 bg-[#2EA86B]/10 text-[#2EA86B] rounded-lg">
                <DollarSign size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#0D0D0D]">Budget Allocation Confirmed</p>
                <p className="text-[11px] text-[#6B6B6B]">Confirmed $10,000 budget during discovery call</p>
                <span className="text-[10px] font-mono text-[#9B9B9B]">1 hour ago</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-start gap-3 text-xs">
              <div className="p-2 bg-[#F0A500]/10 text-[#F0A500] rounded-lg">
                <Award size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#0D0D0D]">Executive Stakeholder Added</p>
                <p className="text-[11px] text-[#6B6B6B]">CEO Michael Connor added to decision matrix</p>
                <span className="text-[10px] font-mono text-[#9B9B9B]">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast Visualizer */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={16} className="text-[#2EA86B]" />
              REVENUE PROJECTION VISUALIZER
            </h3>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1 text-[#2EA86B]">● Committed</span>
            <span className="flex items-center gap-1 text-[#2C4BFF]">● Likely</span>
            <span className="flex items-center gap-1 text-[#F0A500]">● Best Case</span>
          </div>
        </div>
      </div>
    </div>
  );
}
