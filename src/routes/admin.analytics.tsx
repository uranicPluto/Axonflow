import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { 
  getDashboardMetricsFn, 
  getLeadFunnelFn, 
  getRevenueForecastFn, 
  getLeadSourceMetricsFn, 
  getLeadTrendMetricsFn,
  getDashboardAlertsFn,
  runDailyCronJobsFn
} from "@/lib/db";
import { 
  Users, 
  Percent, 
  TrendingUp, 
  Award, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Terminal, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  ShieldAlert,
  BarChart4,
  CalendarDays
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsDashboard,
});

// Shared lead score definitions as constant to prevent database/frontend drift
const SCORE_RANGES = [
  { name: "Priority", min: 90, max: 100, color: "#2C4BFF" },
  { name: "Hot", min: 70, max: 89, color: "#E2603A" },
  { name: "Warm", min: 40, max: 69, color: "#FFA500" },
  { name: "Cold", min: 0, max: 39, color: "#9B9B9B" }
];

function AdminAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<string>("30"); // "7" | "30" | "90"
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [revenueForecast, setRevenueForecast] = useState<any[]>([]);
  const [sourceMetrics, setSourceMetrics] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  // Active sub-tab for trends chart: "leads" | "conversion" | "revenue"
  const [activeTrendTab, setActiveTrendTab] = useState<string>("leads");

  // Calculate startDate and endDate based on selected dropdown range
  const dateBounds = useMemo(() => {
    const end = new Date();
    const days = parseInt(dateRange, 10);
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }, [dateRange]);

  const fetchAnalyticsData = async (showPulse = true) => {
    try {
      if (showPulse) setLoading(true);
      setError(null);

      const [metrics, funnel, forecast, sources, trends, alerts] = await Promise.all([
        getDashboardMetricsFn({ startDate: dateBounds.startDate, endDate: dateBounds.endDate }),
        getLeadFunnelFn({ startDate: dateBounds.startDate, endDate: dateBounds.endDate }),
        getRevenueForecastFn({ startDate: dateBounds.startDate, endDate: dateBounds.endDate }),
        getLeadSourceMetricsFn({ startDate: dateBounds.startDate, endDate: dateBounds.endDate }),
        getLeadTrendMetricsFn({ startDate: dateBounds.startDate, endDate: dateBounds.endDate }),
        getDashboardAlertsFn()
      ]);

      setDashboardMetrics(metrics);
      setFunnelData(funnel);
      setRevenueForecast(forecast);
      setSourceMetrics(sources);
      setTrendData(trends);
      setAlertsData(alerts);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Failed to load business intelligence metrics:", err);
      setError(err?.message || "Internal Server Error: Failed to retrieve executive metrics.");
    } finally {
      if (showPulse) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const handleRunCron = async () => {
    try {
      setCronRunning(true);
      setCronResult(null);
      const res = await runDailyCronJobsFn();
      setCronResult(res);
      await fetchAnalyticsData(false);
    } catch (err: any) {
      setCronResult({ success: false, error: err.message || "Failed to trigger cron tasks" });
    } finally {
      setCronRunning(false);
    }
  };

  // Group lead scores directly from pre-computed server metrics
  const scoresBreakdown = useMemo(() => {
    return dashboardMetrics?.scoresBreakdown || [];
  }, [dashboardMetrics]);

  // Compute Revenue Intelligence metrics directly from pre-computed server metrics
  const revenueIntelligence = useMemo(() => {
    return dashboardMetrics?.revenueIntelligence || {
      currentMonth: { wonRevenue: 0, weightedPipeline: 0, projectedRevenue: 0, opportunities: 0, avgDealValue: 0 },
      priorMonth: { wonRevenue: 0, weightedPipeline: 0, projectedRevenue: 0, opportunities: 0, avgDealValue: 0 },
      rolling30: { wonRevenue: 0, weightedPipeline: 0, projectedRevenue: 0, opportunities: 0, avgDealValue: 0 },
      rolling90: { wonRevenue: 0, weightedPipeline: 0, projectedRevenue: 0, opportunities: 0, avgDealValue: 0 }
    };
  }, [dashboardMetrics]);

  // Render trend indicator helper
  const renderTrend = (current: number, prior: number, isPercent = false) => {
    if (!prior || prior === 0) return null;
    const pctDiff = ((current - prior) / prior) * 100;
    const isUp = pctDiff >= 0;
    
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${isUp ? "text-[#2EA86B]" : "text-[#E05555]"} font-mono`}>
        {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        <span>{Math.abs(pctDiff).toFixed(1)}%</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[#2C4BFF]" size={36} />
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">
          Retrieving executive metrics & pipeline forecast...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#E05555] bg-[#E05555]/5 p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
        <ShieldAlert className="text-[#E05555] mx-auto" size={48} />
        <h3 className="text-lg font-bold text-[#0D0D0D]">BI Analytics Server Error</h3>
        <p className="text-xs text-[#6B6B6B] font-mono leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchAnalyticsData(true)} 
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E05555] text-white font-semibold text-xs px-4 py-2 hover:bg-[#E05555]/90 transition"
        >
          <RefreshCw size={12} /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-sm sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D0D0D] font-display flex items-center gap-2">
            <BarChart4 size={24} className="text-[#2C4BFF]" />
            <span>Executive Analytics & Revenue Intelligence</span>
          </h1>
          <p className="text-xs text-[#6B6B6B] font-mono mt-1">
            Last Updated: {lastUpdated} | Live Sync Enabled
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E4E0] rounded-lg px-2.5 py-1.5 shadow-sm text-xs font-medium text-[#6B6B6B]">
            <CalendarDays size={14} className="text-[#9B9B9B]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#0D0D0D] cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={() => fetchAnalyticsData(true)}
            className="flex items-center gap-1 bg-white hover:bg-[#FAF9F6] border border-[#E5E4E0] rounded-lg px-3 py-1.5 shadow-sm text-xs font-semibold text-[#0D0D0D] transition cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE KPI HEADER */}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        {[
          { 
            title: "Total Leads", 
            value: dashboardMetrics?.totalLeads, 
            prior: dashboardMetrics?.comparisons?.totalLeads,
            label: "Captured in window",
            icon: Users
          },
          { 
            title: "Leads Today", 
            value: dashboardMetrics?.leadsToday, 
            label: "Fresh client intakes",
            icon: Users
          },
          { 
            title: "Leads This Month", 
            value: dashboardMetrics?.leadsThisMonth, 
            label: "Monthly total volume",
            icon: Users
          },
          { 
            title: "Qualified Leads", 
            value: dashboardMetrics?.qualifiedLeads, 
            label: "Hot opportunities",
            icon: Award
          },
          { 
            title: "Won Deals", 
            value: dashboardMetrics?.wonDeals, 
            prior: dashboardMetrics?.comparisons?.totalLeads > 0 ? Math.round(dashboardMetrics?.comparisons?.totalLeads * (dashboardMetrics?.comparisons?.conversionRate/100)) : 0,
            label: "Closed business",
            icon: CheckCircle2
          },
          { 
            title: "Conversion Rate", 
            value: `${dashboardMetrics?.conversionRate}%`, 
            prior: dashboardMetrics?.comparisons?.conversionRate,
            isPercent: true,
            label: "Qualified-to-won %",
            icon: Percent,
            alert: dashboardMetrics?.conversionRate < 15
          },
          { 
            title: "Average Score", 
            value: dashboardMetrics?.averageLeadScore, 
            prior: dashboardMetrics?.comparisons?.averageLeadScore,
            label: "Lead profile quality",
            icon: TrendingUp
          },
          { 
            title: "Projected Revenue", 
            value: `₹${(dashboardMetrics?.projectedRevenue || 0).toLocaleString()}`, 
            prior: dashboardMetrics?.comparisons?.projectedRevenue,
            label: "Weighted pipeline forecast",
            icon: DollarSign
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={`${kpi.title}-${idx}`}
              className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                kpi.alert ? "border-[#E05555] border-l-4" : "border-[#E5E4E0]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9B9B] font-mono">
                  {kpi.title}
                </span>
                <Icon size={16} className={kpi.alert ? "text-[#E05555]" : "text-[#9B9B9B]"} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-[#0D0D0D] font-display">
                  {kpi.value}
                </span>
                {kpi.prior !== undefined && renderTrend(
                  parseFloat(String(kpi.value).replace(/[^0-9.]/g, '')),
                  kpi.prior,
                  kpi.isPercent
                )}
              </div>
              <p className={`mt-1 text-[10px] ${kpi.alert ? "text-[#E05555] font-bold" : "text-[#6B6B6B] font-medium"}`}>
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grid: 7. LEAD TREND ANALYTICS */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E4E0] pb-4 mb-6 gap-4">
          <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">
            Lead & Revenue Trend Analysis
          </h3>
          <div className="flex gap-1.5 bg-[#F8F7F4] rounded-lg p-1 text-[10px] font-bold font-mono">
            {[
              { id: "leads", label: "Leads Count" },
              { id: "conversion", label: "Conversion Rate" },
              { id: "revenue", label: "Projected Revenue" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTrendTab(tab.id)}
                className={`rounded px-2.5 py-1 transition cursor-pointer ${
                  activeTrendTab === tab.id 
                    ? "bg-white text-[#2C4BFF] shadow-sm" 
                    : "text-[#6B6B6B] hover:text-[#0D0D0D]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeTrendTab === 'leads' ? '#2C4BFF' : activeTrendTab === 'conversion' ? '#FFA500' : '#E2603A'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={activeTrendTab === 'leads' ? '#2C4BFF' : activeTrendTab === 'conversion' ? '#FFA500' : '#E2603A'} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" />
              <XAxis dataKey="date" stroke="#9B9B9B" fontSize={10} fontStyle="mono" />
              <YAxis stroke="#9B9B9B" fontSize={10} fontStyle="mono" tickFormatter={(v) => activeTrendTab === 'revenue' ? `₹${v/1000}k` : activeTrendTab === 'conversion' ? `${v}%` : v} />
              <Tooltip 
                formatter={(value) => [activeTrendTab === 'revenue' ? `₹${Number(value).toLocaleString()}` : activeTrendTab === 'conversion' ? `${value}%` : value, '']}
                contentStyle={{ background: "#0D0D0D", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "11px", fontFamily: "monospace" }}
              />
              <Area 
                type="monotone" 
                dataKey={activeTrendTab === 'leads' ? 'leads' : activeTrendTab === 'conversion' ? 'conversionRate' : 'revenue'} 
                stroke={activeTrendTab === 'leads' ? '#2C4BFF' : activeTrendTab === 'conversion' ? '#FFA500' : '#E2603A'} 
                fillOpacity={1}
                fill="url(#trendGrad)"
                strokeWidth={2.5}
              />
              {activeTrendTab === 'leads' && (
                <Line type="monotone" dataKey="qualified" stroke="#FFA500" name="Qualified Leads" strokeWidth={1.5} dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 2. SALES FUNNEL & 5. REVENUE FORECAST */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Funnel */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
              Sales Funnel Conversion Metrics
            </h3>
            
            <div className="space-y-4 mt-6">
              {funnelData?.stages?.map((stage: any, idx: number) => {
                const totalLeads = funnelData?.dropOffs?.totalLeads || 1;
                const overallPct = ((stage.count / totalLeads) * 100).toFixed(1);
                
                return (
                  <div key={stage.stage} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-[#0D0D0D] capitalize">{stage.stage}</span>
                      <span className="text-[#6B6B6B]">
                        {stage.count} deals ({overallPct}% overall)
                      </span>
                    </div>
                    <div className="relative w-full h-5 bg-[#F8F7F4] rounded-md overflow-hidden flex items-center px-2">
                      <div 
                        className="absolute left-0 top-0 h-full bg-[#2C4BFF]/10 border-r border-[#2C4BFF]/30 transition-all duration-500" 
                        style={{ width: `${(stage.count / totalLeads) * 100}%` }}
                      />
                      {idx > 0 && (
                        <span className="relative text-[9px] font-bold font-mono text-[#6B6B6B]">
                          Drop-off: {stage.dropOffRate}% | Retained: {(100 - stage.dropOffRate).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="border-t border-[#E5E4E0] pt-4 mt-6 grid grid-cols-3 gap-2 text-xs font-mono text-center">
            <div>
              <span className="block text-[#9B9B9B] text-[8px] font-bold uppercase">New → Call Request</span>
              <span className="font-bold text-[#0D0D0D] flex items-center justify-center gap-0.5 mt-0.5">
                <Clock size={12} className="text-[#9B9B9B]" />
                {funnelData?.averageTimes?.['new_lead->call_requested'] || 0} hrs
              </span>
            </div>
            <div>
              <span className="block text-[#9B9B9B] text-[8px] font-bold uppercase">Qualified → Proposal</span>
              <span className="font-bold text-[#0D0D0D] flex items-center justify-center gap-0.5 mt-0.5">
                <Clock size={12} className="text-[#9B9B9B]" />
                {funnelData?.averageTimes?.['qualified->proposal_sent'] || 0} hrs
              </span>
            </div>
            <div>
              <span className="block text-[#9B9B9B] text-[8px] font-bold uppercase">Proposal → Won</span>
              <span className="font-bold text-[#0D0D0D] flex items-center justify-center gap-0.5 mt-0.5">
                <Clock size={12} className="text-[#9B9B9B]" />
                {funnelData?.averageTimes?.['proposal_sent->won'] || 0} hrs
              </span>
            </div>
          </div>
        </div>

        {/* 6. REVENUE FORECAST CHART */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
            Revenue Forecast Model
          </h3>
          <p className="text-[10px] text-[#6B6B6B] font-mono leading-relaxed mt-2 bg-[#F8F7F4] p-2.5 rounded-lg border border-[#E5E4E0]">
            <strong>Forecast Formula</strong>: Won deals = 100% of estimate. Proposal sent = 80%. Qualified = 50%. Call requested = 20%. New = 10%. Estimates calculated via budget values or averages.
          </p>
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" />
                <XAxis dataKey="month" stroke="#9B9B9B" fontSize={10} fontStyle="mono" />
                <YAxis stroke="#9B9B9B" fontSize={10} fontStyle="mono" tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ background: "#0D0D0D", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "11px", fontFamily: "monospace" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                <Line type="monotone" dataKey="won" stroke="#E2603A" name="Won Revenue" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pipeline" stroke="#FFA500" name="Pipeline (Weighted)" strokeWidth={1.5} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="total" stroke="#2C4BFF" name="Projected Total" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. REVENUE INTELLIGENCE MULTI-PERIOD COMPARISONS */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
          Revenue Intelligence Matrices
        </h3>
        <div className="grid gap-6 md:grid-cols-4 mt-4">
          {[
            { title: "Current Month", data: revenueIntelligence.currentMonth },
            { title: "Previous Month", data: revenueIntelligence.priorMonth },
            { title: "Rolling 30 Days", data: revenueIntelligence.rolling30 },
            { title: "Rolling 90 Days", data: revenueIntelligence.rolling90 }
          ].map((period, idx) => (
            <div key={idx} className="rounded-lg border border-[#E5E4E0] bg-[#FAF9F6]/50 p-4 space-y-3 font-mono text-xs">
              <span className="block font-bold text-[#0D0D0D] border-b border-[#E5E4E0] pb-2 text-[10px] uppercase font-mono">
                {period.title}
              </span>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Won Revenue:</span>
                <span className="font-bold text-[#0D0D0D]">₹{period.data.wonRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Weighted Pipeline:</span>
                <span className="font-bold text-[#0D0D0D]">₹{period.data.weightedPipeline.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Projected:</span>
                <span className="font-bold text-[#2C4BFF]">₹{period.data.projectedRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E4E0] pt-2">
                <span className="text-[#6B6B6B]">Opportunities:</span>
                <span className="font-bold text-[#0D0D0D]">{period.data.opportunities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Avg Deal Value:</span>
                <span className="font-bold text-[#0D0D0D]">₹{period.data.avgDealValue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: 3. LEAD SCORE DISTRIBUTION & 4. LEAD SOURCE PERFORMANCE */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score Distribution */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
              Lead Score Distributions
            </h3>
            <div className="h-44 mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ background: "#0D0D0D", borderRadius: "8px", border: "none", color: "#FFF", fontSize: "11px", fontFamily: "monospace" }}
                  />
                  <Pie
                    data={scoresBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {scoresBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 text-[10px] font-mono border-t border-[#E5E4E0] pt-4">
            {scoresBreakdown.map((s) => (
              <div key={s.name} className="flex flex-col gap-0.5 bg-[#F8F7F4]/80 p-2 rounded border border-[#E5E4E0]/40">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-bold text-[#0D0D0D]">{s.name}</span>
                </div>
                <span className="text-[#6B6B6B] mt-0.5">
                  Count: {s.value} ({s.percentage}%)
                </span>
                <span className="text-[#6B6B6B]">
                  Avg Score: {s.avgScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source Performance */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
            Lead Source Performance (Conversion & Revenue)
          </h3>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E4E0] text-[9px] font-bold text-[#9B9B9B] uppercase font-mono">
                  <th className="py-2.5">Source</th>
                  <th className="py-2.5">Total Leads</th>
                  <th className="py-2.5">Qualified</th>
                  <th className="py-2.5">Won</th>
                  <th className="py-2.5">Conversion</th>
                  <th className="py-2.5 text-right">Won Revenue</th>
                  <th className="py-2.5 text-right">Projected (Won+Pipe)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F7F4] font-medium">
                {sourceMetrics.map((src) => (
                  <tr key={src.source} className="hover:bg-[#F8F7F4]/50 transition">
                    <td className="py-3 font-semibold text-[#0D0D0D] capitalize">{src.source}</td>
                    <td className="py-3 text-[#6B6B6B] font-mono">{src.total}</td>
                    <td className="py-3 text-[#6B6B6B] font-mono">{src.qualified}</td>
                    <td className="py-3 text-[#6B6B6B] font-mono">{src.won}</td>
                    <td className="py-3 font-mono">
                      <span className="bg-[#3B5BDB]/5 text-[#3B5BDB] px-1.5 py-0.5 rounded">
                        {src.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-[#0D0D0D]">₹{src.revenue.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-[#2C4BFF]">₹{src.projectedRevenue.toLocaleString()}</td>
                  </tr>
                ))}
                {sourceMetrics.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#9B9B9B] italic">No sources recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 8. OPERATIONAL / REVENUE ALERTS & 16. CRON CONTROLLER */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* KPI Alerts Feed */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4 flex items-center gap-1.5">
            <AlertCircle size={16} className="text-[#9B9B9B]" />
            <span>Operational Alert Center</span>
          </h3>
          
          <div className="space-y-3 mt-4 max-h-[220px] overflow-y-auto">
            {alertsData.map((alert, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg border p-3 text-xs flex gap-2.5 items-start ${
                  alert.severity === 'critical' 
                    ? "bg-[#E05555]/5 border-[#E05555]/30 text-[#E05555]" 
                    : "bg-[#FFA500]/5 border-[#FFA500]/30 text-[#FFA500]"
                }`}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#0d0d0d] block">{alert.title}</span>
                  <span className="text-[10px] text-[#6B6B6B] block leading-relaxed">{alert.message}</span>
                  <span className="text-[9px] text-[#9b9b9b] block font-mono">
                    Logged: {new Date(alert.time).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {alertsData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-[#9B9B9B] gap-2">
                <CheckCircle2 className="text-[#2EA86B]" size={24} />
                <span>All key operational indicators are healthy. No active alerts.</span>
              </div>
            )}
          </div>
        </div>

        {/* Cron Execution console */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-4 mb-4">
              <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display flex items-center gap-1.5">
                <Terminal size={16} className="text-[#9B9B9B]" />
                <span>Scheduler Console</span>
              </h3>
              <button
                onClick={handleRunCron}
                disabled={cronRunning}
                className="flex items-center gap-1.5 rounded-lg bg-[#2C4BFF] hover:bg-[#2C4BFF]/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                {cronRunning ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} />
                    <span>Run Daily Aggregations</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Consolidate metrics cache (`daily_metrics`), evaluate thresholds, and trigger automated daily HTML executive report dispatching.
            </p>
          </div>

          <div className="mt-4">
            {cronResult && (
              <div className="rounded-lg border border-[#E5E4E0] bg-[#FAF9F6] p-4 text-xs font-mono text-[#0D0D0D] max-h-36 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2 text-[10px] font-bold text-[#9B9B9B]">
                  <span>REPORT DISPATCH LOGS</span>
                  <span>STATUS: {cronResult.success ? "SUCCESS" : "FAILED"}</span>
                </div>
                {cronResult.success ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">{cronResult.report}</pre>
                ) : (
                  <span className="text-[#E05555] font-bold">Error: {cronResult.error}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
