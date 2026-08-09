import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProjectsFn, deleteProjectFn, saveProjectFn, Project } from "@/lib/db";
import { Plus, Edit3, Trash2, Eye, ArrowUp, ArrowDown, Save } from "lucide-react";

export const Route = createFileRoute("/admin/portfolio/")({
  component: PortfolioList,
});

function PortfolioList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const data = await getProjectsFn();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load portfolio items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the case study "${title}"?`)) {
      try {
        await deleteProjectFn({ data: id });
        loadProjects();
      } catch (err) {
        console.error(err);
        alert("Failed to delete case study");
      }
    }
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      await saveProjectFn({
        data: {
          id: project.id,
          published: !project.published,
        },
      });
      loadProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to update publication status");
    }
  };

  const handleUpdateSortOrder = async (project: Project, val: number) => {
    setSavingOrder(project.id);
    try {
      await saveProjectFn({
        data: {
          id: project.id,
          sort_order: val,
        },
      });
      loadProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to save sort order");
    } finally {
      setSavingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading case studies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0D0D0D] tracking-tight">Portfolio Case Studies</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Reorder and publish client transformation summaries on the public website.
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/portfolio/new" })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] transition shadow-sm"
        >
          <Plus size={14} />
          <span>New Case Study</span>
        </button>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E4E0] bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E4E0] bg-[#F8F7F4]/50 text-[10px] font-bold text-[#6B6B6B] uppercase font-mono tracking-wider">
              <th className="p-4">Sort Order</th>
              <th className="p-4">Headline / Client</th>
              <th className="p-4">Industry / Service</th>
              <th className="p-4">Stats & Metrics</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4E0] text-xs">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-[#F8F7F4]/30 transition">
                  <td className="p-4 w-[100px]">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={project.sort_order}
                        onBlur={(e) => handleUpdateSortOrder(project, parseInt(e.target.value) || 99)}
                        disabled={savingOrder === project.id}
                        className="w-12 rounded-lg border border-[#E5E4E0] bg-white px-2 py-1 text-center font-mono font-bold text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-[#0D0D0D]">
                    <div className="max-w-[280px] truncate" title={project.title}>
                      {project.title}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#9B9B9B]">
                        {project.industry_tag}
                      </span>
                      <span className="bg-[#3B5BDB]/5 text-[#3B5BDB] px-1.5 py-0.5 rounded text-[9px] font-bold w-fit">
                        {project.service_tag}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5 text-[#6B6B6B]">
                      <div>
                        <span className="font-bold text-[#3B5BDB]">{project.result_1_value}</span> ·{" "}
                        <span className="text-[10px]">{project.result_1_label}</span>
                      </div>
                      {project.result_2_value && (
                        <div>
                          <span className="font-bold text-[#3B5BDB]">{project.result_2_value}</span> ·{" "}
                          <span className="text-[10px]">{project.result_2_label}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(project)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase hover:opacity-85 transition ${
                        project.published
                          ? "bg-[#2EA86B]/10 text-[#2EA86B]"
                          : "bg-[#F0A500]/10 text-[#F0A500]"
                      }`}
                    >
                      {project.published ? "Published ✓" : "Draft ⏱"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/case-studies/${project.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#6B6B6B] hover:text-[#0D0D0D] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="View live site"
                      >
                        <Eye size={12} />
                      </a>
                      <button
                        onClick={() => navigate({ to: `/admin/portfolio/${project.id}` })}
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#3B5BDB] hover:text-[#2f4bc4] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="Edit study"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#E05555] hover:text-[#c94545] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="Delete study"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#6B6B6B] italic">
                  No portfolio case studies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
