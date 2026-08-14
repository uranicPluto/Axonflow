import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCustomerSuccessAgentFn } from "@/lib/db";
import { Heart, RefreshCw, TrendingUp, ShieldAlert, Award, Zap, Users, CheckCircle2, ArrowRight, Activity, Smile } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/customer-success-war-room")({
  component: CustomerSuccessWarRoom,
});

function CustomerSuccessWarRoom() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCustomerSuccessAgentFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load customer success war room data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Customer Success War Room...</div>
      </div>
    );
  }

  const expansionChartData = data.expansionOpportunities?.map((e: any) => ({
    name: e.clientName.replace(" SaaS", "").replace(" Inc", ""),
    expansion: e.expectedRevenueImpact
  })) || [
    { name: "Acme Corp", expansion: 24000 },
    { name: "Fintech Dynamics", expansion: 36000 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="text-[#2EA86B]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Customer Success War Room</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Post-Sales Lifecycle OS: Onboarding Readiness, Delivery Health, Renewal Forecasts & Expansion Pipeline</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync CS Command Room</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">AVG CUSTOMER HEALTH</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display mt-1">{data.customerHealthAverage || 91}/100</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Champion Category Portfolio</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#E05555]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">ACCOUNTS AT RISK</span>
          <div className="text-3xl font-bold text-[#E05555] font-display mt-1">{data.topAccountsAtRisk?.length || 0}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Zero Churn Exposure</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">EXPANSION PIPELINE</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display mt-1">+${data.totalExpansionImpact?.toLocaleString()}</div>
          <span className="text-[11px] text-[#2C4BFF] font-semibold block">Active Upsell & Cross-Sell</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">AVERAGE RENEWAL PROBABILITY</span>
          <div className="text-3xl font-bold text-[#2EA86B] font-display mt-1">92%</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Strong Contract Retention</span>
        </div>
      </div>

      {/* Grid: Customer Health Leaderboard & Renewal Pipeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Health Leaderboard */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-[#2EA86B]" />
              CUSTOMER HEALTH LEADERBOARD
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.customerHealthReports?.map((h: any) => (
              <div key={h.clientName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{h.clientName}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Engagement: {h.vectorBreakdown?.engagementScore}/100 • Delivery: {h.vectorBreakdown?.deliveryScore}/100</span>
                </div>
                <div className="text-right">
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[11px] font-bold px-2.5 py-1 rounded block">
                    {h.healthScore}/100 ({h.healthCategory})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Renewal Pipeline */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} />
              RENEWAL PIPELINE MONITOR
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.renewalForecasts?.map((r: any) => (
              <div key={r.clientName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{r.clientName}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Contract ARR: ${r.contractValue?.toLocaleString()} • Churn Probability: {r.churnProbability}%</span>
                </div>
                <div className="text-right">
                  <span className="bg-[#2C4BFF]/10 text-[#2C4BFF] font-mono text-[11px] font-bold px-2 py-0.5 rounded block">
                    {r.renewalProbability}% Renewal Probability
                  </span>
                  <span className="text-[10px] text-[#2EA86B] font-semibold block mt-0.5">Expansion: {r.expansionProbability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Expansion Forecast (Recharts) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2EA86B]" />
            ESTIMATED EXPANSION LIFT BY CLIENT ACCOUNT ($)
          </h3>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expansionChartData}>
              <XAxis dataKey="name" stroke="#9B9B9B" fontSize={11} />
              <YAxis stroke="#9B9B9B" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Expansion Lift"]} />
              <Bar dataKey="expansion" fill="#2C4BFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Delivery Risk Monitor & Customer Sentiment */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Risk Monitor */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#F0A500] font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              DELIVERY HEALTH & PROJECT MOMENTUM
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.deliveryHealthReports?.map((d: any) => (
              <div key={d.clientName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{d.clientName}</h4>
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    Score: {d.healthScore}/100 ({d.status})
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B6B]">Momentum: {d.projectMomentum}</p>
                <div className="p-2 rounded bg-white border border-[#E5E4E0] text-[11px] text-[#2C4BFF]">
                  <strong>Recommendation:</strong> {d.recommendations?.[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Sentiment Feed */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
              <Smile size={16} />
              CUSTOMER SENTIMENT & ADVOCACY FEED
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.sentimentReports?.map((s: any) => (
              <div key={s.clientName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{s.clientName}</h4>
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {s.sentimentCategory} ({s.sentimentScore}/100)
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B6B]">Trend: {s.trend}</p>
                <p className="text-[11px] text-[#2EA86B]"><strong>Advocacy Indicator:</strong> {s.advocacyIndicators?.[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
