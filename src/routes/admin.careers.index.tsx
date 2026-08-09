import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRolesFn, deleteRoleFn, saveRoleFn, CareerRole } from "@/lib/db";
import { Plus, Edit3, Trash2, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/careers/")({
  component: CareersList,
});

function CareersList() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async () => {
    try {
      const data = await getRolesFn();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load career listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the job listing for "${title}"?`)) {
      try {
        await deleteRoleFn({ data: id });
        loadRoles();
      } catch (err) {
        console.error(err);
        alert("Failed to delete role listing");
      }
    }
  };

  const handleToggleOpen = async (role: CareerRole) => {
    try {
      await saveRoleFn({
        data: {
          id: role.id,
          open: !role.open,
        },
      });
      loadRoles();
    } catch (err) {
      console.error(err);
      alert("Failed to update hiring status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading career registry...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0D0D0D] tracking-tight">Careers Registry</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Manage open roles, salaries, requirements, and hiring tags for House of Workflow.
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/careers/new" })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] transition shadow-sm"
        >
          <Plus size={14} />
          <span>New Job Role</span>
        </button>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E4E0] bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E4E0] bg-[#F8F7F4]/50 text-[10px] font-bold text-[#6B6B6B] uppercase font-mono tracking-wider">
              <th className="p-4">Role Title</th>
              <th className="p-4">Team</th>
              <th className="p-4">Location</th>
              <th className="p-4">Type</th>
              <th className="p-4">Salary Range</th>
              <th className="p-4">Hiring Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4E0] text-xs">
            {roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-[#F8F7F4]/30 transition">
                  <td className="p-4 font-semibold text-[#0D0D0D]">
                    <div className="max-w-[240px] truncate" title={role.title}>
                      {role.title}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#6B6B6B]">{role.team}</td>
                  <td className="p-4 text-[#6B6B6B]">{role.location}</td>
                  <td className="p-4">
                    <span className="bg-[#3B5BDB]/5 text-[#3B5BDB] px-1.5 py-0.5 rounded font-bold text-[9px] uppercase">
                      {role.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#6B6B6B]">{role.salary_range || "Not specified"}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleOpen(role)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase hover:opacity-85 transition ${
                        role.open
                          ? "bg-[#2EA86B]/10 text-[#2EA86B]"
                          : "bg-[#E05555]/10 text-[#E05555]"
                      }`}
                    >
                      {role.open ? "Open ✓" : "Closed ✕"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/careers/${role.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#6B6B6B] hover:text-[#0D0D0D] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="View live site"
                      >
                        <Eye size={12} />
                      </a>
                      <button
                        onClick={() => navigate({ to: `/admin/careers/${role.id}` })}
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#3B5BDB] hover:text-[#2f4bc4] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="Edit listing"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id, role.title)}
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#E05555] hover:text-[#c94545] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="Delete listing"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#6B6B6B] italic">
                  No job listing roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
