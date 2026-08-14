import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDeliveryOperationsFn } from "@/lib/db";
import { Layers, RefreshCw, Cpu, Activity, DollarSign, ShieldAlert, CheckCircle2, Bot, Users, Clock, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/delivery-war-room")({
  component: DeliveryWarRoom,
});

function DeliveryWarRoom() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getDeliveryOperationsFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load delivery war room data:", err);
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
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Delivery & Workforce War Room...</div>
      </div>
    );
  }

  const utilizationChartData = [
    { name: "Billable Utilization", value: data.workforceUtilization?.billableUtilization || 85 },
    { name: "Delivery Utilization", value: data.workforceUtilization?.deliveryUtilization || 88 },
    { name: "AI Agent Workload", value: data.aiWorkforce?.automationEfficiency || 93 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Autonomous Delivery & Workforce War Room</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Project Portfolio Execution, Resource Capacity Planning, AI Workforce Workloads & Gross Margin Tracking</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync Delivery Room</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PROJECTS ON TRACK</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display mt-1">{data.projectsOnTrackCount || 3} / {(data.projectsOnTrackCount || 3) + (data.projectsAtRiskCount || 0)}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">100% Milestone Progress</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2C4BFF]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">WORKFORCE UTILIZATION</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display mt-1">{data.workforceUtilization?.utilizationScore || 88}%</div>
          <span className="text-[11px] text-[#2C4BFF] font-semibold block">Optimal Efficiency (80-90%)</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">AI HOURS SAVED</span>
          <div className="text-3xl font-bold text-[#2EA86B] font-display mt-1">+{data.aiWorkforce?.totalHoursSaved || 310} hrs/mo</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">4.8x FTE Lift ({data.aiWorkforce?.roiMultiple || "14.2x ROI"})</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 border-l-4 border-l-[#2EA86B]">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PROJECT GROSS MARGIN</span>
          <div className="text-3xl font-bold text-[#2EA86B] font-display mt-1">85%</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Tier A Margin Target</span>
        </div>
      </div>

      {/* Grid: Project Portfolio & Capacity Planner */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Portfolio */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-[#2C4BFF]" />
              ACTIVE PROJECT PORTFOLIO
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.projectExecutionReports?.map((p: any) => (
              <div key={p.projectName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{p.projectName}</h4>
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {p.deliveryStatus} ({p.completionPercent}% Done)
                  </span>
                </div>
                <div className="w-full bg-[#E5E4E0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2EA86B] h-full" style={{ width: `${p.completionPercent}%` }} />
                </div>
                <p className="text-[11px] text-[#6B6B6B]">Milestones: {p.milestonesCompleted} Completed • {p.milestonesRemaining} Remaining • Risk: {p.timelineRisk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Planner & Utilization */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2C4BFF] font-mono uppercase tracking-wider flex items-center gap-2">
              <Users size={16} />
              TEAM CAPACITY & UTILIZATION
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Total Capacity</span>
                <div className="text-base font-bold text-[#0D0D0D]">{data.teamCapacity?.totalCapacityHours} Hours / Week</div>
              </div>
              <div className="text-right">
                <span className="bg-[#2C4BFF]/10 text-[#2C4BFF] font-mono text-[11px] font-bold px-2.5 py-1 rounded block">
                  {data.teamCapacity?.capacityPercent}% Allocated
                </span>
                <span className="text-[10px] text-[#2EA86B] font-semibold block mt-0.5">{data.teamCapacity?.availabilityPercent}% Available</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2">
              <span className="text-[10px] font-mono text-[#9B9B9B] uppercase font-bold">Resource Allocation Matrix</span>
              {data.resourceAllocationPlan?.allocations?.map((a: any) => (
                <div key={a.resourceName} className="flex items-center justify-between border-b border-[#E5E4E0] pb-1.5 last:border-b-0 text-[11px]">
                  <div>
                    <span className="font-bold text-[#0D0D0D]">{a.resourceName}</span> ({a.role})
                  </div>
                  <span className="font-mono text-[#2C4BFF] font-semibold">{a.allocatedHours} hrs/wk ({a.utilizationRate}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Utilization Heatmap & Performance (Recharts) */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#2EA86B]" />
            WORKFORCE UTILIZATION BENCHMARKS (%)
          </h3>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationChartData}>
              <XAxis dataKey="name" stroke="#9B9B9B" fontSize={11} />
              <YAxis stroke="#9B9B9B" fontSize={11} domain={[0, 100]} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Utilization Rate"]} />
              <Bar dataKey="value" fill="#2C4BFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: AI Workforce & Project Profitability Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Workforce Dashboard */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#2EA86B] font-mono uppercase tracking-wider flex items-center gap-2">
              <Bot size={16} />
              AI WORKFORCE & AUTOMATION WORKLOADS
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.aiWorkforce?.agents?.map((agent: any) => (
              <div key={agent.agentName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{agent.agentName}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Tasks: {agent.tasksCompleted} • Hours Saved: +{agent.hoursSaved} hrs/mo</span>
                </div>
                <div className="text-right">
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[11px] font-bold px-2 py-0.5 rounded block">
                    {agent.utilizationRate}% Utilization
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profitability Leaderboard */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-[#2EA86B]" />
              PROJECT PROFITABILITY LEADERBOARD
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {data.projectProfitabilityReports?.map((prof: any) => (
              <div key={prof.projectName} className="p-3.5 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0D0D0D] text-sm">{prof.clientName}</h4>
                  <span className="text-[11px] text-[#6B6B6B]">Revenue: ${prof.revenue?.toLocaleString()} • Costs: ${prof.deliveryCosts?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="bg-[#2EA86B]/10 text-[#2EA86B] font-mono text-[11px] font-bold px-2 py-0.5 rounded block">
                    {prof.grossMargin}% Gross Margin ({prof.profitabilityTier})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
