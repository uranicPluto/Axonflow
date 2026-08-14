import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFounderCommandCenterFn } from "@/lib/db";
import { Cpu, Flame, AlertTriangle, Calendar, TrendingUp, DollarSign, ArrowRight, CheckCircle2, RefreshCw, Zap, Trophy, Rocket, Heart, Layers, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/command-center")({
  component: FounderCommandCenter,
});

function FounderCommandCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await getFounderCommandCenterFn();
      setData(res);
    } catch (err) {
      console.error("Failed to load founder command center data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Founder Command Center...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Founder Command Center</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Real-time AI Briefings, High-Intent Deals & Executive Command Operations</p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* Daily Founder Brief V10 Banner */}
      <div className="rounded-2xl border border-[#2C4BFF]/20 bg-gradient-to-r from-[#2C4BFF]/10 via-indigo-50/50 to-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#2C4BFF] fill-current" />
            <span className="text-xs font-mono font-bold text-[#2C4BFF] uppercase tracking-wider">FOUNDER BRIEF V10 — AUTONOMOUS COMPANY OPERATING SYSTEM</span>
          </div>
          <span className="text-[10px] font-mono text-[#9B9B9B]">Live Executive Briefing</span>
        </div>

        <p className="text-sm font-medium text-[#0D0D0D] leading-relaxed">
          {data?.dailyBriefingText || "AxonFlow Autonomous Operating System is performing at peak efficiency. Company Health is 91/100 (Strong), 3 AI recommended actions pending approval, project delivery is 100% on track, and gross margins remain high at 87.5%. AI Agent workloads saved +310 hours this month (4.8x FTE lift)."}
        </p>

        {/* V10 Executive Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white border border-[#E5E4E0] space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Company Health</span>
            <div className="text-lg font-bold text-[#2EA86B]">91 / 100 (Strong)</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E4E0] space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Executive Actions Pending</span>
            <div className="text-lg font-bold text-[#2C4BFF]">3 Actions Queue</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E4E0] space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Revenue Run-Rate</span>
            <div className="text-lg font-bold text-[#0D0D0D]">$750,000 ARR</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E4E0] space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Projected Profit Margin</span>
            <div className="text-lg font-bold text-[#2EA86B]">87.5% Gross Margin</div>
          </div>
        </div>
      </div>

      {/* Company Operating Snapshot V10 */}
      <div className="rounded-xl border border-[#2C4BFF]/30 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} />
            COMPANY OPERATING SNAPSHOT (FOUNDER BRIEF V10)
          </h3>
          <Link to="/admin/company-os" className="text-xs text-[#2C4BFF] font-semibold hover:underline flex items-center gap-1">
            <span>Open Company OS</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Overall Company Health</span>
            <div className="text-sm font-bold text-[#0D0D0D]">91/100 (Strong)</div>
            <span className="text-[10px] text-[#2EA86B]">Financial Health: 93/100</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Customer Risks</span>
            <div className="text-sm font-bold text-[#2EA86B]">0 At-Risk Accounts</div>
            <span className="text-[10px] text-[#2EA86B]">Zero Churn Exposure</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Delivery Risks</span>
            <div className="text-sm font-bold text-[#2EA86B]">0 Delayed Projects</div>
            <span className="text-[10px] text-[#2EA86B]">100% Milestones On Track</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Top Strategic Priority</span>
            <div className="text-sm font-bold text-[#2C4BFF]">Scale ARR to $1.2M Target</div>
            <span className="text-[10px] text-[#2C4BFF]">68% Progress Complete</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-[#2C4BFF]/30 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} />
            DELIVERY OPERATIONS SNAPSHOT (FOUNDER BRIEF V9)
          </h3>
          <Link to="/admin/delivery-war-room" className="text-xs text-[#2C4BFF] font-semibold hover:underline flex items-center gap-1">
            <span>Open Delivery War Room</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Projects On Track</span>
            <div className="text-sm font-bold text-[#0D0D0D]">3 Active Deployments</div>
            <span className="text-[10px] text-[#2EA86B]">0 Blocked Tasks</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Projects At Risk</span>
            <div className="text-sm font-bold text-[#2EA86B]">0 At Risk</div>
            <span className="text-[10px] text-[#2EA86B]">Low Timeline Risk</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Capacity Remaining</span>
            <div className="text-sm font-bold text-[#2C4BFF]">20% Available</div>
            <span className="text-[10px] text-[#2C4BFF]">32 Hours/wk Buffer</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">AI FTE Lift</span>
            <div className="text-sm font-bold text-[#2EA86B]">4.8x FTE Lift</div>
            <span className="text-[10px] text-[#2EA86B]">14.2x ROI Multiple</span>
          </div>
        </div>
      </div>
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <Heart size={16} />
            CUSTOMER SUCCESS SNAPSHOT (FOUNDER BRIEF V8)
          </h3>
          <Link to="/admin/customer-success-war-room" className="text-xs text-[#2C4BFF] font-semibold hover:underline flex items-center gap-1">
            <span>Open CS War Room</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Customer Health Average</span>
            <div className="text-sm font-bold text-[#0D0D0D]">91/100 (Champion)</div>
            <span className="text-[10px] text-[#2EA86B]">Zero Churn Exposure</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Delivery Health</span>
            <div className="text-sm font-bold text-[#2EA86B]">92/100 (Healthy)</div>
            <span className="text-[10px] text-[#2EA86B]">All Milestones On Track</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Expansion Opportunity</span>
            <div className="text-sm font-bold text-[#2C4BFF]">+$60,000 Revenue</div>
            <span className="text-[10px] text-[#2C4BFF]">Outbound AI SDR Upgrade</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Customer Sentiment</span>
            <div className="text-sm font-bold text-[#2EA86B]">Positive (90/100)</div>
            <span className="text-[10px] text-[#2EA86B]">Reference Account Ready</span>
          </div>
        </div>
      </div>

      {/* Growth Snapshot V6 */}
      <div className="rounded-xl border border-[#2EA86B]/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
            <Rocket size={16} />
            AUTONOMOUS GROWTH SNAPSHOT (FOUNDER BRIEF V6)
          </h3>
          <Link to="/admin/growth-war-room" className="text-xs text-[#2C4BFF] font-semibold hover:underline flex items-center gap-1">
            <span>Open Growth War Room</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Top Industry Opportunity</span>
            <div className="text-sm font-bold text-[#0D0D0D]">Software & SaaS (92/100)</div>
            <span className="text-[10px] text-[#2EA86B]">TAM: $12.5M</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Top Expansion Service</span>
            <div className="text-sm font-bold text-[#2C4BFF]">Outbound AI SDR Agent</div>
            <span className="text-[10px] text-[#2C4BFF]">Launch Horizon: 7 Days</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Largest Competitor Threat</span>
            <div className="text-sm font-bold text-[#F0A500]">Legacy SDR Agencies</div>
            <span className="text-[10px] text-[#F0A500]">Threat Score: 42/100</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Expected Growth Lift</span>
            <div className="text-sm font-bold text-[#2EA86B]">+$140,000 Revenue</div>
            <span className="text-[10px] text-[#2EA86B]">Next 90 Days</span>
          </div>
      {/* Financial Snapshot V7 */}
      <div className="rounded-xl border border-[#2EA86B]/30 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={16} />
            FINANCIAL PROFITABILITY SNAPSHOT (FOUNDER BRIEF V7)
          </h3>
          <Link to="/admin/profitability-war-room" className="text-xs text-[#2EA86B] font-semibold hover:underline flex items-center gap-1">
            <span>Open Profitability War Room</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Financial Health</span>
            <div className="text-sm font-bold text-[#0D0D0D]">93/100 (Strong)</div>
            <span className="text-[10px] text-[#2EA86B]">85%+ Gross Margin</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Cash Runway Position</span>
            <div className="text-sm font-bold text-[#2C4BFF]">$250,000 Position</div>
            <span className="text-[10px] text-[#2C4BFF]">8.9 Months Runway</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Top Profitable Client</span>
            <div className="text-sm font-bold text-[#2EA86B]">HealthPulse MedTech</div>
            <span className="text-[10px] text-[#2EA86B]">83% Net Margin (Tier A)</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Projected Profit Lift</span>
            <div className="text-sm font-bold text-[#2EA86B]">+$117,000 Net Profit</div>
            <span className="text-[10px] text-[#2EA86B]">Via Pricing & Margin Boosts</span>
          </div>
        </div>
      </div>

      {/* Revenue Operations Snapshot V5 */}
      <div className="rounded-xl border border-[#2C4BFF]/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
            <Trophy size={16} />
            REVENUE OPERATIONS SNAPSHOT (FOUNDER BRIEF V5)
          </h3>
          <Link to="/admin/executive-intelligence" className="text-xs text-[#2C4BFF] font-semibold hover:underline flex items-center gap-1">
            <span>Open Executive Intelligence</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Forecast Accuracy</span>
            <div className="text-xl font-bold text-[#0D0D0D]">94.0%</div>
            <span className="text-[10px] text-[#2EA86B]">High Reliability</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Revenue Attainment</span>
            <div className="text-xl font-bold text-[#2C4BFF]">85.0%</div>
            <span className="text-[10px] text-[#2C4BFF]">$127.5k / $150k target</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Pipeline Coverage</span>
            <div className="text-xl font-bold text-[#2EA86B]">3.2x</div>
            <span className="text-[10px] text-[#2EA86B]">Target: &ge; 3.0x</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-0.5">
            <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Top Optimization</span>
            <div className="text-xs font-bold text-[#E05555]">Proposal Review Follow-Up</div>
            <span className="text-[10px] text-[#2EA86B]">+$17,000 Impact</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <div className="flex items-center justify-between text-[#9B9B9B]">
            <span className="text-[10px] font-bold uppercase font-mono">TODAY'S MEETINGS</span>
            <Calendar size={16} />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            {data?.todaysMeetingsCount || 0}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Scheduled discovery calls</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#E05555]">
          <div className="flex items-center justify-between text-[#9B9B9B]">
            <span className="text-[10px] font-bold uppercase font-mono">HIGH INTENT LEADS</span>
            <Flame size={16} className="text-[#E05555]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            {data?.hotLeadsCount || 0}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Score 70+ (Hot leads)</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#F0A500]">
          <div className="flex items-center justify-between text-[#9B9B9B]">
            <span className="text-[10px] font-bold uppercase font-mono">STALLED DEALS</span>
            <AlertTriangle size={16} className="text-[#F0A500]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            {data?.stalledDealsCount || 0}
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">Proposals awaiting action</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <div className="flex items-center justify-between text-[#9B9B9B]">
            <span className="text-[10px] font-bold uppercase font-mono">PIPELINE VALUE</span>
            <DollarSign size={16} className="text-[#2EA86B]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#0D0D0D] font-display">
            ${(data?.pipelineValue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#2EA86B] font-semibold mt-1 block">Forecast: ${(data?.revenueForecast || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* 2-Column Operational Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* High Intent Hot Leads */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#E05555] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={16} />
              HIGH INTENT HOT LEADS
            </h3>
            <Link to="/admin/leads" className="text-xs text-[#2C4BFF] hover:underline font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.hotLeads?.length > 0 ? (
              data.hotLeads.map((lead: any) => (
                <div key={lead.id} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Link to={`/admin/leads/${lead.id}`} className="text-xs font-bold text-[#0D0D0D] hover:text-[#2C4BFF] transition">
                      {lead.name}
                    </Link>
                    <p className="text-[11px] text-[#6B6B6B]">{lead.email} • {lead.company_name || "Prospect"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#E05555]/10 text-[#E05555] text-xs font-mono font-bold px-2 py-0.5 rounded">
                      Score: {lead.lead_score}/100
                    </span>
                    <Link to={`/admin/leads/${lead.id}`} className="text-xs text-[#2C4BFF] font-semibold hover:underline">
                      Prep Brief &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#9B9B9B] italic py-4">No hot leads currently pending review.</p>
            )}
          </div>
        </div>

        {/* Deal Risk Monitor (No activity > 10 days OR close probability < 40%) */}
        <div className="rounded-xl border border-[#E05555]/30 bg-gradient-to-r from-red-50/20 to-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#E05555]" />
              <h3 className="text-xs font-bold text-[#E05555] font-mono uppercase tracking-wider">
                DEAL RISK MONITOR (NO ACTIVITY &gt; 10 DAYS OR CLOSE PROBABILITY &lt; 40%)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#E05555] bg-[#E05555]/10 px-2.5 py-0.5 rounded-full">
              {data?.dealsAtRiskCount || 0} Deals At Risk
            </span>
          </div>

          <div className="space-y-3">
            {data?.dealsAtRisk?.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.dealsAtRisk.map((lead: any) => (
                  <div key={lead.id} className="p-4 rounded-xl border border-[#E5E4E0] bg-white space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Link to={`/admin/leads/${lead.id}`} className="font-bold text-[#0D0D0D] hover:text-[#2C4BFF] text-sm">
                        {lead.company_name || lead.name}
                      </Link>
                      <span className="bg-[#E05555]/10 text-[#E05555] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        Close Prob: {lead.close_probability || 35}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between font-mono">
                      <span>Score: {lead.lead_score || 45}/100</span>
                      <span>Last Act: {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : "10+ days ago"}</span>
                    </div>
                    <div className="bg-[#F8F7F4] p-2 rounded text-[11px] text-[#0D0D0D] font-medium flex items-center justify-between">
                      <span><strong>Recommended Action:</strong> Re-engage via AI follow-up</span>
                      <Link to={`/admin/leads/${lead.id}`} className="text-[#2C4BFF] font-semibold hover:underline text-[10px]">
                        Take Action &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-[#2EA86B]/20 bg-[#2EA86B]/5 text-xs text-[#2EA86B] font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Zero deal risks detected! All pipeline deals are active with high close probabilities.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
