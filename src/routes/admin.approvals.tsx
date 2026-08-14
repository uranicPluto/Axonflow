import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPendingActionsFn, processApprovalFn } from "@/lib/db";
import { CheckCircle2, XCircle, Edit3, ShieldAlert, Mail, Calendar, Send, UserCheck, RefreshCw, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/approvals")({
  component: ApprovalsCenter,
});

function ApprovalsCenter() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const pending = await getPendingActionsFn();
      setItems(pending || []);
    } catch (err) {
      console.error("Failed to load pending queue actions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (actionId: string, decision: "approved" | "rejected" | "edited") => {
    try {
      setProcessingId(actionId);
      await processApprovalFn({ data: { actionId, decision } });
      await loadData();
    } catch (err) {
      console.error("Failed to process approval action:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading Human-in-the-Loop Approval Queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Human-in-the-Loop Approval Center</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Review, approve, edit, or reject AI-generated sales execution actions</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-white border border-[#E5E4E0] hover:bg-[#F8F7F4] text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="p-6 rounded-xl border border-[#E5E4E0] bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E5E4E0] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#2C4BFF]/10 text-[#2C4BFF]">
                    <Mail size={16} />
                  </span>
                  <span className="font-bold text-[#0D0D0D] text-sm uppercase font-mono tracking-wider">
                    {item.action_type?.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#F0A500]/15 text-[#F0A500] px-2 py-0.5 rounded-full">
                    REQUIRES APPROVAL
                  </span>
                </div>
                <span className="text-xs font-mono text-[#9B9B9B]">
                  Queued: {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              {/* Action Content Payload */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6B6B]">Recipient: <strong className="text-[#0D0D0D]">{item.payload?.recipient || item.payload?.leadName || 'Prospect'}</strong></span>
                  <span className="text-[11px] text-[#2C4BFF] font-semibold">Stage: Proposal Follow-Up</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E5E4E0] space-y-2">
                  <p className="font-bold text-[#0D0D0D]">Subject: {item.payload?.subject || "Follow up"}</p>
                  <p className="text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">{item.payload?.emailBody || item.payload?.body || "Outreach content ready for execution."}</p>
                </div>
              </div>

              {/* Action Control Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleAction(item.id, "rejected")}
                  disabled={processingId === item.id}
                  className="inline-flex items-center gap-1.5 bg-red-50 text-[#E05555] hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleAction(item.id, "edited")}
                  disabled={processingId === item.id}
                  className="inline-flex items-center gap-1.5 bg-[#F8F7F4] text-[#0D0D0D] hover:bg-[#E5E4E0] border border-[#E5E4E0] px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  <Edit3 size={14} />
                  <span>Edit & Approve</span>
                </button>

                <button
                  onClick={() => handleAction(item.id, "approved")}
                  disabled={processingId === item.id}
                  className="inline-flex items-center gap-1.5 bg-[#2EA86B] hover:bg-[#258756] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve & Execute</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-xl border border-[#2EA86B]/20 bg-[#2EA86B]/5 text-center space-y-3">
            <CheckCircle2 size={32} className="mx-auto text-[#2EA86B]" />
            <h3 className="text-sm font-bold text-[#0D0D0D]">Approval Queue Clean!</h3>
            <p className="text-xs text-[#6B6B6B]">Zero pending AI sales actions requiring founder approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
