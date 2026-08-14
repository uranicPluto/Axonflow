import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getExecutiveReportFn } from "@/lib/db";
import { ShieldCheck, RefreshCw, CheckCircle2, XCircle, Clock, Zap, Target, TrendingUp, DollarSign, Users, Layers, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/action-center")({
  component: ActionApprovalCenter,
});

function ActionApprovalCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionStatuses, setActionStatuses] = useState<Record<string, "approved" | "rejected" | "postponed">>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getExecutiveReportFn();
      setData(res || null);
    } catch (err) {
      console.error("Failed to load action center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = (id: string, status: "approved" | "rejected" | "postponed") => {
    setActionStatuses((prev) => ({ ...prev, [id]: status }));
  };

  if (loading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Executive Action Approval Center...</div>
      </div>
    );
  }

  const categoryIcons: Record<string, any> = {
    Revenue: TrendingUp,
    Growth: Zap,
    Finance: DollarSign,
    "Customer Success": Users,
    Delivery: Layers
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Action Approval Center</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Autonomous Agent Recommendation Governance & Human-in-the-Loop Execution Control</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Sync Action Center</span>
        </button>
      </div>

      {/* Recommended Executive Actions Queue */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
          <h3 className="text-xs font-bold text-[#0D0D0D] font-mono uppercase tracking-wider flex items-center gap-2">
            <Zap size={16} className="text-[#2C4BFF]" />
            AI RECOMMENDED EXECUTIVE ACTIONS ({data.pendingActions?.length || 0})
          </h3>
          <span className="text-[11px] text-[#2EA86B] font-semibold">Human-in-the-Loop Governance Active</span>
        </div>

        <div className="space-y-4">
          {data.pendingActions?.map((act: any) => {
            const Icon = categoryIcons[act.category] || Target;
            const currentStatus = actionStatuses[act.id] || act.status;

            return (
              <div key={act.id} className="p-5 rounded-2xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E5E4E0] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white border border-[#E5E4E0]">
                      <Icon size={16} className="text-[#2C4BFF]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#9B9B9B] uppercase">{act.category}</span>
                      <h4 className="font-bold text-[#0D0D0D] text-sm">{act.title}</h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded self-start sm:self-auto ${
                    currentStatus === "approved" ? "bg-[#2EA86B]/10 text-[#2EA86B]" :
                    currentStatus === "rejected" ? "bg-[#E05555]/10 text-[#E05555]" :
                    currentStatus === "postponed" ? "bg-[#F0A500]/10 text-[#F0A500]" :
                    "bg-[#2C4BFF]/10 text-[#2C4BFF]"
                  }`}>
                    {currentStatus.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-[#4B4B4B] leading-relaxed">{act.reasoning}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-[#6B6B6B]">
                    Impact: <strong>{act.impact}</strong> • Confidence: <strong>{act.confidence}%</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(act.id, "approved")}
                      disabled={currentStatus === "approved"}
                      className="inline-flex items-center gap-1.5 bg-[#2EA86B] hover:bg-[#2EA86B]/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleAction(act.id, "postponed")}
                      disabled={currentStatus === "postponed"}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      <Clock size={13} />
                      <span>Postpone</span>
                    </button>

                    <button
                      onClick={() => handleAction(act.id, "rejected")}
                      disabled={currentStatus === "rejected"}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#E05555]/30 text-[#E05555] hover:bg-[#E05555]/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
