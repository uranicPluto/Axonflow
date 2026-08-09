import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeadsFn, getPostsFn, getProjectsFn, getRolesFn, getRecentActivityFn, Lead } from "@/lib/db";
import { Users, FileText, Briefcase, Plus, ChevronRight, Activity, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    newLeads: 0,
    publishedPosts: 0,
    liveProjects: 0,
    openRoles: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [leads, posts, projects, roles, activity] = await Promise.all([
          getLeadsFn(),
          getPostsFn(),
          getProjectsFn(),
          getRolesFn(),
          getRecentActivityFn(),
        ]);

        setStats({
          newLeads: leads.filter((l) => l.status === "new").length,
          publishedPosts: posts.filter((p) => p.status === "published").length,
          liveProjects: projects.filter((p) => p.published).length,
          openRoles: roles.filter((r) => r.open).length,
        });

        setRecentLeads(leads.filter((l) => l.status === "new").slice(0, 5));
        setRecentActivity(activity.slice(0, 8));
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getServiceLabel = (srv: string | undefined) => {
    if (!srv) return "Not specified";
    if (srv === "web_dev") return "Web Dev";
    if (srv === "ai_automation") return "AI Automation";
    if (srv === "both") return "Web & AI";
    return "Not sure";
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { title: "New Leads", value: stats.newLeads, label: "Awaiting review", to: "/admin/leads", icon: Users, color: "border-l-[#E05555]" },
    { title: "Published Posts", value: stats.publishedPosts, label: "Live in blog", to: "/admin/blog", icon: FileText, color: "border-l-[#2EA86B]" },
    { title: "Live Projects", value: stats.liveProjects, label: "Case studies", to: "/admin/portfolio", icon: Briefcase, color: "border-l-[#3B5BDB]" },
    { title: "Open Roles", value: stats.openRoles, label: "Hiring postings", to: "/admin/careers", icon: Briefcase, color: "border-l-[#F0A500]" },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              className={`rounded-xl border border-[#E5E4E0] border-l-4 bg-white p-5 hover:border-slate-350 transition hover:shadow-sm ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9B9B] font-mono">
                  {card.title}
                </span>
                <Icon size={16} className="text-[#9B9B9B]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-[#0D0D0D] font-display">
                  {card.value}
                </span>
              </div>
              <p className="mt-1 text-[10px] font-medium text-[#6B6B6B]">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Grid split */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Leads column */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-4 mb-4">
              <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">
                New Leads
              </h3>
              <span className="bg-[#E05555]/10 text-[#E05555] text-[10px] font-bold px-2 py-0.5 rounded">
                Unresolved
              </span>
            </div>
            {recentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E4E0] text-[10px] font-bold text-[#9B9B9B] uppercase font-mono">
                      <th className="py-2">Name</th>
                      <th className="py-2">Service</th>
                      <th className="py-2">Received</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F7F4]">
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#F8F7F4]/50 transition">
                        <td className="py-2.5 font-semibold text-[#0D0D0D]">{lead.name}</td>
                        <td className="py-2.5">
                          <span className="bg-[#3B5BDB]/5 text-[#3B5BDB] px-1.5 py-0.5 rounded font-medium">
                            {getServiceLabel(lead.service_interest)}
                          </span>
                        </td>
                        <td className="py-2.5 text-[#6B6B6B]">{formatDate(lead.created_at)}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => navigate({ to: `/admin/leads/${lead.id}` })}
                            className="text-[#3B5BDB] hover:underline font-bold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#9B9B9B] italic">
                No new leads waiting for review. Outstanding job!
              </div>
            )}
          </div>
          {recentLeads.length > 0 && (
            <div className="border-t border-[#E5E4E0] pt-4 mt-4">
              <Link
                to="/admin/leads"
                className="text-xs text-[#3B5BDB] hover:underline font-semibold flex items-center gap-1"
              >
                <span>View all leads</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-4 mb-4">
            <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display">
              Recent Activity
            </h3>
            <Activity size={16} className="text-[#9B9B9B]" />
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs leading-normal">
                  <div className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-[#3B5BDB]" />
                  <div className="flex-1">
                    <span className="text-[#0D0D0D] font-medium">{log.message}</span>
                    <span className="block text-[10px] text-[#9B9B9B] mt-0.5 font-mono">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#9B9B9B] italic">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Create buttons */}
      <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#0D0D0D] tracking-tight font-display border-b border-[#E5E4E0] pb-4 mb-4">
          Quick Create
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => navigate({ to: "/admin/blog/new" })}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] transition"
          >
            <Plus size={14} className="text-[#3B5BDB]" />
            <span>New Blog Post</span>
          </button>
          <button
            onClick={() => navigate({ to: "/admin/portfolio/new" })}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] transition"
          >
            <Plus size={14} className="text-[#3B5BDB]" />
            <span>New Case Study</span>
          </button>
          <button
            onClick={() => navigate({ to: "/admin/careers/new" })}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F8F7F4] transition"
          >
            <Plus size={14} className="text-[#3B5BDB]" />
            <span>New Job Listing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
