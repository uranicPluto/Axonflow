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

      {/* Delivery Operations Snapshot V9 */}
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

      {/* Customer Success Snapshot V8 */}
      <div className="rounded-xl border border-[#2C4BFF]/30 bg-white p-6 shadow-sm space-y-4">
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
    </div>
  );
}
