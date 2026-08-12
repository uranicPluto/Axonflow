import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { getLeadsFn, updateLeadStatusFn, Lead } from "@/lib/db";
import { Search, Filter, Kanban, Table, ArrowUpDown, Flame } from "lucide-react";
import { LeadWorkspaceModal } from "@/components/admin/LeadWorkspaceModal";

export const Route = createFileRoute("/admin/leads/")({
  component: LeadsInbox,
});

function LeadsInbox() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedWorkspaceLead, setSelectedWorkspaceLead] = useState<Lead | null>(null);
  
  // Filters & Search State
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sorting State
  const [sortField, setSortField] = useState<keyof Lead>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const loadLeads = async () => {
    try {
      const data = await getLeadsFn();
      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter and Sort leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // Apply Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.email.toLowerCase().includes(query) ||
          (l.phone && l.phone.includes(query))
      );
    }

    // Apply Status Filter
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    // Apply Custom Sorting
    result.sort((a, b) => {
      // Hot leads (score >= 70) are always sorted to the top under the "new" filter
      if (statusFilter === "new") {
        const aIsHot = (a.lead_score || 0) >= 70;
        const bIsHot = (b.lead_score || 0) >= 70;
        if (aIsHot && !bIsHot) return -1;
        if (!aIsHot && bIsHot) return 1;
      }

      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    return result;
  }, [leads, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const paginatedLeads = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedLeads.slice(startIdx, startIdx + itemsPerPage);
  }, [processedLeads, currentPage]);

  const totalPages = Math.ceil(processedLeads.length / itemsPerPage);

  // Drag and Drop (Kanban)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: targetStatus, updated_at: new Date().toISOString() } : l))
      );
      await updateLeadStatusFn({ data: { id, status: targetStatus } });
    } catch (err) {
      console.error("Failed to drop lead card:", err);
      loadLeads(); // rollback
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getSourceBadge = (src: string) => {
    if (src === "book_a_call") {
      return <span className="bg-[#3B5BDB]/10 text-[#3B5BDB] text-[9px] font-bold px-2 py-0.5 rounded font-mono">Book Call</span>;
    }
    return <span className="bg-[#A06EFF]/10 text-[#A06EFF] text-[9px] font-bold px-2 py-0.5 rounded font-mono">Experience Form</span>;
  };

  const getServiceLabel = (srv: string | undefined) => {
    if (!srv) return "Not specified";
    if (srv === "web_dev") return "Web Dev";
    if (srv === "ai_automation") return "AI Automation";
    if (srv === "both") return "Web & AI";
    return "Not sure";
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "new":
        return <span className="bg-[#E05555]/10 text-[#E05555] text-[9px] font-bold px-2 py-0.5 rounded uppercase">🔴 New</span>;
      case "in_progress":
        return <span className="bg-[#F0A500]/10 text-[#F0A500] text-[9px] font-bold px-2 py-0.5 rounded uppercase">🟡 In Progress</span>;
      case "meeting_booked":
        return <span className="bg-[#3B5BDB]/10 text-[#3B5BDB] text-[9px] font-bold px-2 py-0.5 rounded uppercase">📅 Meeting Booked</span>;
      case "won":
        return <span className="bg-[#2EA86B]/10 text-[#2EA86B] text-[9px] font-bold px-2 py-0.5 rounded uppercase">✅ Won</span>;
      case "archived":
      default:
        return <span className="bg-[#9B9B9B]/10 text-[#9B9B9B] text-[9px] font-bold px-2 py-0.5 rounded uppercase">⬛ Archived</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading leads database...</div>
      </div>
    );
  }

  const columns = [
    { label: "NEW", status: "new" },
    { label: "IN PROGRESS", status: "in_progress" },
    { label: "MEETING BOOKED", status: "meeting_booked" },
    { label: "WON", status: "won" },
    { label: "ARCHIVED", status: "archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E4E0] pb-5">
        <div className="flex flex-wrap gap-1 bg-white p-1 border border-[#E5E4E0] rounded-xl shadow-inner">
          {[
            { label: "All", value: "all" },
            { label: "New", value: "new" },
            { label: "In Progress", value: "in_progress" },
            { label: "Meeting Booked", value: "meeting_booked" },
            { label: "Won", value: "won" },
            { label: "Archived", value: "archived" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setCurrentPage(1);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg transition font-semibold ${
                statusFilter === opt.value
                  ? "bg-[#3B5BDB] text-white"
                  : "text-[#6B6B6B] hover:text-[#0D0D0D]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-white p-1 border border-[#E5E4E0] rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${viewMode === "table" ? "bg-[#3B5BDB]/10 text-[#3B5BDB]" : "text-[#9B9B9B]"}`}
              title="Table view"
            >
              <Table size={16} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg transition ${viewMode === "kanban" ? "bg-[#3B5BDB]/10 text-[#3B5BDB]" : "text-[#9B9B9B]"}`}
              title="Kanban view"
            >
              <Kanban size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9B9B9B]">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl border border-[#E5E4E0] bg-white py-2 pl-9 pr-4 text-xs text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/55 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/10 transition"
          />
        </div>
      </div>

      {/* RENDER TABLE VIEW */}
      {viewMode === "table" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#E5E4E0] bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E4E0] bg-[#F8F7F4]/50 text-[10px] font-bold text-[#6B6B6B] uppercase font-mono tracking-wider">
                  <th className="p-4 cursor-pointer hover:text-[#0D0D0D]" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 cursor-pointer hover:text-[#0D0D0D]" onClick={() => handleSort("created_at")}>
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th className="p-4">Status</th>
                  <th className="p-4 cursor-pointer hover:text-[#0D0D0D]" onClick={() => handleSort("lead_score")}>
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4E0] text-xs">
                {paginatedLeads.length > 0 ? (
                  paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#F8F7F4]/30 transition cursor-pointer"
                      onClick={() => setSelectedWorkspaceLead(lead)}
                    >
                      <td className="p-4 font-semibold text-[#0D0D0D]">
                        <div className="flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          {(lead.lead_score || 0) >= 70 && (
                            <span className="flex items-center gap-0.5 bg-[#E05555]/10 text-[#E05555] text-[9px] font-bold px-1 py-0.2 rounded">
                              <Flame size={10} className="fill-current" /> Hot
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{getSourceBadge(lead.source)}</td>
                      <td className="p-4">
                        <span className="bg-[#F8F7F4] text-[#6B6B6B] border border-[#E5E4E0] px-1.5 py-0.5 rounded font-semibold text-[10px]">
                          {getServiceLabel(lead.service_interest)}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{lead.phone || "—"}</td>
                      <td className="p-4 font-mono">{lead.email}</td>
                      <td className="p-4 text-[#6B6B6B]">{formatDate(lead.created_at)}</td>
                      <td className="p-4">{getStatusBadge(lead.status)}</td>
                      <td className="p-4 font-mono font-bold text-[#3B5BDB]">
                        {lead.lead_score !== undefined ? `${lead.lead_score}/100` : "—"}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedWorkspaceLead(lead)}
                          className="bg-white border border-[#E5E4E0] text-[#0D0D0D] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#F8F7F4] transition shadow-sm"
                        >
                          Workspace
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#6B6B6B] italic">
                      No matching leads in search records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-[#6B6B6B]">
                Showing {Math.min(processedLeads.length, (currentPage - 1) * itemsPerPage + 1)}–
                {Math.min(processedLeads.length, currentPage * itemsPerPage)} of {processedLeads.length} leads
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                  className="rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                  className="rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER KANBAN PIPELINE VIEW */}
      {viewMode === "kanban" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-start overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnLeads = leads.filter((l) => l.status === column.status);
            return (
              <div
                key={column.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
                className="bg-white border border-[#E5E4E0] rounded-xl p-4 min-h-[500px] flex flex-col gap-3 shadow-sm select-none"
              >
                <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
                  <span className="text-[10px] font-bold text-[#6B6B6B] font-mono tracking-wider">
                    {column.label}
                  </span>
                  <span className="bg-[#3B5BDB]/10 text-[#3B5BDB] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => navigate({ to: `/admin/leads/${lead.id}` })}
                      className="bg-[#F8F7F4]/40 border border-[#E5E4E0] rounded-xl p-3 hover:border-slate-350 hover:shadow-sm cursor-grab active:cursor-grabbing transition text-xs flex flex-col gap-2 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-[#0D0D0D] truncate">{lead.name}</span>
                        {(lead.lead_score || 0) >= 70 && (
                          <span className="flex items-center gap-0.5 bg-[#E05555]/10 text-[#E05555] text-[9px] font-bold px-1 py-0.2 rounded shrink-0">
                            <Flame size={10} className="fill-current" /> Hot
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {getSourceBadge(lead.source)}
                        <span className="bg-white border border-[#E5E4E0] text-[#6B6B6B] text-[9px] px-1.5 py-0.2 rounded font-semibold">
                          {getServiceLabel(lead.service_interest)}
                        </span>
                      </div>

                      {lead.lead_score !== undefined && (
                        <div className="text-[10px] font-medium text-[#6B6B6B] font-mono">
                          Score: <span className="font-bold text-[#3B5BDB]">{lead.lead_score}/100</span>
                        </div>
                      )}

                      <div className="border-t border-[#E5E4E0] pt-2 mt-1 text-[9px] text-[#9B9B9B] font-mono flex items-center justify-between">
                        <span>{formatDate(lead.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="h-full flex items-center justify-center py-10 border-2 border-dashed border-[#E5E4E0] rounded-xl text-[10px] text-[#9B9B9B] italic text-center">
                      Drag leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEAD WORKSPACE MODAL */}
      {selectedWorkspaceLead && (
        <LeadWorkspaceModal
          lead={selectedWorkspaceLead}
          onClose={() => setSelectedWorkspaceLead(null)}
          onLeadUpdated={loadLeads}
        />
      )}
    </div>
  );
}
