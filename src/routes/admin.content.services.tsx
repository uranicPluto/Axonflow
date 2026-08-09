import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getServicesFn, saveServiceFn, deleteServiceFn, ServiceItem } from "@/lib/db";
import { ArrowLeft, Plus, Trash2, Edit3, Save, Check } from "lucide-react";

export const Route = createFileRoute("/admin/content/services")({
  component: EditServicesSection,
});

function EditServicesSection() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Editor State
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadServices = async () => {
    try {
      const data = await getServicesFn();
      setServices(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      console.error("Failed to load services database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAddNew = () => {
    setEditingItem({
      number: `0${services.length + 1}`,
      name: "",
      tagline: "",
      description: "",
      featured: false,
      sort_order: services.length + 1,
      published: true,
      stat_1_val: "",
      stat_1_lbl: "",
      stat_2_val: "",
      stat_2_lbl: "",
      stat_3_val: "",
      stat_3_lbl: "",
    });
  };

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the service "${name}"?`)) {
      try {
        await deleteServiceFn({ data: id });
        loadServices();
        if (editingItem?.id === id) setEditingItem(null);
      } catch (err) {
        console.error(err);
        alert("Failed to delete service item");
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.number) {
      alert("Service name and index number are required!");
      return;
    }

    setSaving(true);
    try {
      await saveServiceFn({ data: editingItem });
      setEditingItem(null);
      loadServices();
    } catch (err) {
      console.error(err);
      alert("Failed to save service item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading core services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/admin/content" })}
            className="p-2 rounded-lg border border-[#E5E4E0] hover:bg-[#F8F7F4] transition text-[#6B6B6B]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">Edit Core Services</h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Manage services lists, specifications, metrics, and cards.</p>
          </div>
        </div>

        {!editingItem && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] transition shadow-sm"
          >
            <Plus size={14} />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — Services list (1 col wide) */}
        <div className="space-y-3 lg:col-span-1">
          <span className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-2">
            CORE OFFERINGS LIST
          </span>
          {services.map((srv) => (
            <div
              key={srv.id}
              onClick={() => handleEdit(srv)}
              className={`rounded-xl border p-4 bg-white flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                editingItem?.id === srv.id
                  ? "border-[#3B5BDB] ring-2 ring-[#3B5BDB]/15"
                  : "border-[#E5E4E0] hover:border-slate-350"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#3B5BDB]">{srv.number}</span>
                  <h4 className="text-xs font-bold text-[#0D0D0D]">{srv.name}</h4>
                </div>
                <div className="flex gap-1">
                  {srv.featured && (
                    <span className="bg-[#A06EFF]/10 text-[#A06EFF] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Featured
                    </span>
                  )}
                  {srv.published ? (
                    <span className="bg-[#2EA86B]/10 text-[#2EA86B] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Live
                    </span>
                  ) : (
                    <span className="bg-[#9B9B9B]/10 text-[#9B9B9B] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEdit(srv)}
                  className="p-1 text-[#6B6B6B] hover:text-[#3B5BDB] rounded hover:bg-[#F8F7F4] transition"
                  title="Edit item"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(srv.id, srv.name)}
                  className="p-1 text-[#E05555] hover:text-[#c94545] rounded hover:bg-[#F8F7F4] transition"
                  title="Delete item"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-[#E5E4E0] rounded-xl text-xs text-[#9B9B9B] italic">
              No services registered yet.
            </div>
          )}
        </div>

        {/* Right Column — Inline Form Workspace (2 cols wide) */}
        <div className="lg:col-span-2">
          {editingItem ? (
            <form onSubmit={handleSaveSubmit} className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
                <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase">
                  {editingItem.id ? `EDIT SERVICE: ${editingItem.name}` : "ADD NEW SERVICE"}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="rounded-xl border border-[#E5E4E0] bg-white text-xs text-[#6B6B6B] hover:text-[#0D0D0D] px-3.5 py-1.5 hover:bg-[#F8F7F4] transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#3B5BDB] text-white px-4 py-1.5 text-xs font-semibold hover:bg-[#2f4bc4] disabled:opacity-50 transition"
                  >
                    <Save size={12} />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Index Number (e.g. 01, 02)
                  </label>
                  <input
                    type="text"
                    value={editingItem.number || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, number: e.target.value })}
                    placeholder="e.g. 01"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] font-mono focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Sorting order Index
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. Custom Web Development"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={editingItem.tagline || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })}
                    placeholder="e.g. Tailored software built with modern stacks"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Provide a thorough paragraph details regarding what this service covers..."
                    rows={4}
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-sans"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.featured || false}
                      onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                      className="rounded border-[#E5E4E0] text-[#3B5BDB] focus:ring-[#3B5BDB]/10 h-4 w-4"
                    />
                    <span>Featured on Home</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.published || false}
                      onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                      className="rounded border-[#E5E4E0] text-[#3B5BDB] focus:ring-[#3B5BDB]/10 h-4 w-4"
                    />
                    <span>Publish live</span>
                  </label>
                </div>
              </div>

              {/* Service Metrics (3 stats) */}
              <div className="border-t border-[#E5E4E0] pt-4 space-y-4">
                <h4 className="text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono">
                  SERVICE OUTCOMES STATS (OPTIONAL)
                </h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { numKey: "stat_1_val" as const, lblKey: "stat_1_lbl" as const, index: 1 },
                    { numKey: "stat_2_val" as const, lblKey: "stat_2_lbl" as const, index: 2 },
                    { numKey: "stat_3_val" as const, lblKey: "stat_3_lbl" as const, index: 3 },
                  ].map((stat) => (
                    <div key={stat.index} className="border border-[#E5E4E0] rounded-xl p-3 bg-[#F8F7F4]/30 space-y-2">
                      <span className="block text-[9px] font-bold tracking-wider text-[#9B9B9B] font-mono">
                        STAT #{stat.index}
                      </span>
                      <div>
                        <input
                          type="text"
                          value={editingItem[stat.numKey] || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, [stat.numKey]: e.target.value })}
                          placeholder="Value (e.g. 100%)"
                          className="w-full rounded border border-[#E5E4E0] bg-white px-2 py-1 text-[11px] font-bold text-[#3B5BDB]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editingItem[stat.lblKey] || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, [stat.lblKey]: e.target.value })}
                          placeholder="Label description"
                          className="w-full rounded border border-[#E5E4E0] bg-white px-2 py-1 text-[10px] text-[#0D0D0D]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full rounded-xl border border-dashed border-[#E5E4E0] bg-[#F8F7F4]/20 flex flex-col items-center justify-center p-8 text-center text-xs text-[#9B9B9B] min-h-[300px]">
              <span>Select a service on the left to edit its specifications, or click "Add New Service" to create a new one.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
