import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFinanceAgentFn } from "@/lib/db";
import { DollarSign, RefreshCw, TrendingUp, ShieldAlert, Award, PieChart, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/profitability-war-room")({
  component: ProfitabilityWarRoom,
});

function ProfitabilityWarRoom() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getFinanceAgentFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load profitability war room data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing CFO Profitability War Room...</div>
      </div>
    );
  }

  const cashflowChartData = data.cashForecast?.forecasts?.map((f: any) => ({
    name: f.period,
    Revenue: f.projectedRevenue,
    Expenses: f.projectedExpenses,
    NetProfit: f.projectedProfit
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <DollarSign className="text-[#2EA86B]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Profitability War Room</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">CFO Financial Health, Unit Economics, Margin Maximization & Cash Flow Forecasting</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync CFO Room</span>
        </button>
      </div>

      {/* Top Financial Health & Unit Economics Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">FINANCIAL HEALTH SCORE</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display mt-1">{data.financialHealth?.score || 93}/100</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">{data.financialHealth?.rating}</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">LTV : CAC RATIO</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display mt-1">{data.unitEconomics?.ltvCacRatio || 5.8}x</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">{data.unitEconomics?.healthRating}</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#F0A500]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PAYBACK PERIOD</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display mt-1">{data.unitEconomics?.paybackPeriodMonths || 1.8} Mo</div>
          <span className="text-[11px] text-[#6B6B6B] font-semibold block">CAC Payback Runway</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">AVERAGE GROSS MARGIN</span>
          <div className="text-3xl font-bold text-[#2EA86B] font-display mt-1">{data.unitEconomics?.grossMargin || 85}%</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">High-Margin Software Stack</span>
        </div>
      </div>

      {/* Grid: Client Profitability & Service Margins */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Profitability Ranking */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-[#2C4BFF]" />
              CLIENT PROFITABILITY TIER RANKING
            </h3>
          </div>

          <div className="space-y-3">
            {data.topClients?.map((c: any) => (
              <div key={c.clientName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{c.clientName}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Revenue: ${c.revenue?.toLocaleString()} • Cost: ${c.cost?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[11px] font-bold px-2 py-0.5 rounded block">
                    +{c.margin}% Margin
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] block mt-0.5">{c.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Profitability Ranking */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
              <PieChart size={16} />
              SERVICE OFFERING MARGINS
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.topServices?.map((s: any) => (
              <div key={s.serviceName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{s.serviceName}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Net Profit: ${s.grossProfit?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="bg-[#2C4BFF]/10 text-[#2C4BFF] font-mono text-[11px] font-bold px-2 py-0.5 rounded block">
                    {s.margin}% Gross Margin
                  </span>
                  <span className="text-[10px] text-[#2EA86B] font-semibold block mt-0.5">Potential: {s.growthPotential}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast Chart (Recharts) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2EA86B]" />
            CASH FLOW & PROFIT PROJECTION ($)
          </h3>
          <span className="text-xs font-bold text-[#2EA86B] font-mono">Runway: {data.cashForecast?.runwayMonths} Months</span>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowChartData}>
              <XAxis dataKey="name" stroke="#9B9B9B" fontSize={11} />
              <YAxis stroke="#9B9B9B" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Amount"]} />
              <Area type="monotone" dataKey="Revenue" stroke="#2C4BFF" fill="#2C4BFF" fillOpacity={0.15} />
              <Area type="monotone" dataKey="NetProfit" stroke="#2EA86B" fill="#2EA86B" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hiring Impact & Financial Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hiring Impact Analysis */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-[#2C4BFF]" />
              HIRING IMPACT & ROI MODELING
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.hiringRecommendations?.map((h: any) => (
              <div key={h.role} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{h.role}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Cost: ${h.annualCost?.toLocaleString()}/yr • Profit Lift: +${h.expectedProfitImpact?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded block ${h.recommendation.includes("Strong Buy") ? "bg-[#2EA86B]/10 text-[#2EA86B]" : "bg-[#F0A500]/10 text-[#F0A500]"}`}>
                    {h.recommendation}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] block mt-0.5">Payback: {h.paybackMonths} Months</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Optimization Opportunities */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} />
              PROFIT OPTIMIZATION OPPORTUNITIES
            </h3>
            <span className="text-xs font-bold text-[#2EA86B] font-mono">Total Impact: +${data.projectedProfitImpact?.toLocaleString()}</span>
          </div>

          <div className="space-y-3 text-xs">
            {data.optimizationOpportunities?.map((opt: any) => (
              <div key={opt.title} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{opt.title}</h4>
                  <p className="text-[11px] text-[#6B6B6B]">{opt.description}</p>
                </div>
                <div className="text-right pl-3 shrink-0">
                  <span className="text-xs font-bold text-[#2EA86B] block">+${opt.expectedProfitIncrease?.toLocaleString()}</span>
                  <span className="text-[10px] text-[#6B6B6B] block">Difficulty: {opt.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
