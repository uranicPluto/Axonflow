import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteContentFn, saveSiteContentFn } from "@/lib/db";
import { ArrowLeft, Plus, Trash2, Edit3, Save, Linkedin } from "lucide-react";

export const Route = createFileRoute("/admin/content/team")({
  component: EditTeamSection,
});

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  avatar_url: string;
}

function EditTeamSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Team array state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<TeamMember> | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getSiteContentFn();
        const rawJson = content.team_founders_json;
        if (rawJson) {
          try {
            setMembers(JSON.parse(rawJson));
          } catch {
            setMembers([]);
          }
        } else {
          // Seed with default founder if empty
          const seed = [
            {
              id: "jay-mahajan",
              name: "Jay Mahajan",
              role: "Founder & Automation Architect",
              bio: "Builds high-performance AI agents and custom web applications. Ex-systems engineer focused on cutting operation times.",
              linkedin: "https://linkedin.com/in/jay-mahajan",
              avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            },
          ];
          setMembers(seed);
        }
      } catch (err) {
        console.error("Failed to load team CMS content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleAddNew = () => {
    setEditingItem({
      id: `member-${Date.now()}`,
      name: "",
      role: "",
      bio: "",
      linkedin: "",
      avatar_url: "",
    });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingItem(member);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the team directory?`)) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      if (editingItem?.id === id) setEditingItem(null);
      await saveSiteContentFn({ data: { key: "team_founders_json", value: JSON.stringify(updated) } });
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.role) {
      alert("Name and Role are required fields!");
      return;
    }

    setSaving(true);
    let updated: TeamMember[] = [];
    const itemExists = members.some((m) => m.id === editingItem.id);

    if (itemExists) {
      updated = members.map((m) => (m.id === editingItem.id ? (editingItem as TeamMember) : m));
    } else {
      updated = [...members, editingItem as TeamMember];
    }

    try {
      await saveSiteContentFn({ data: { key: "team_founders_json", value: JSON.stringify(updated) } });
      setMembers(updated);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save team member details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading team registry...</div>
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
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">Edit Team Members</h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Manage founder bios, headshots, roles, and LinkedIn links.</p>
          </div>
        </div>

        {!editingItem && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] transition shadow-sm"
          >
            <Plus size={14} />
            <span>Add Founder/Member</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Members List */}
        <div className="space-y-3 lg:col-span-1">
          <span className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-2">
            TEAM PROFILES LIST
          </span>
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => handleEdit(member)}
              className={`rounded-xl border p-4 bg-white flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                editingItem?.id === member.id
                  ? "border-[#3B5BDB] ring-2 ring-[#3B5BDB]/15"
                  : "border-[#E5E4E0] hover:border-slate-350"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"}
                  alt={member.name}
                  className="h-10 w-10 rounded-full object-cover border border-[#E5E4E0]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#0D0D0D]">{member.name}</h4>
                  <p className="text-[10px] text-[#6B6B6B] font-medium">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-[#6B6B6B] hover:text-[#3B5BDB] rounded hover:bg-[#F8F7F4] transition"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-1 text-[#E05555] hover:text-[#c94545] rounded hover:bg-[#F8F7F4] transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-[#E5E4E0] rounded-xl text-xs text-[#9B9B9B] italic">
              No team profiles registered.
            </div>
          )}
        </div>

        {/* Right column — Form Workspace */}
        <div className="lg:col-span-2">
          {editingItem ? (
            <form onSubmit={handleSaveSubmit} className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
                <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase">
                  {editingItem.id && members.some(m => m.id === editingItem.id) ? "EDIT PROFILE" : "CREATE NEW PROFILE"}
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. Jay Mahajan"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Corporate Role / Title
                  </label>
                  <input
                    type="text"
                    value={editingItem.role || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    placeholder="e.g. Founder & Automation Architect"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={editingItem.avatar_url || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, avatar_url: e.target.value })}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    LinkedIn Link URL
                  </label>
                  <input
                    type="text"
                    value={editingItem.linkedin || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, linkedin: e.target.value })}
                    placeholder="e.g. https://linkedin.com/in/..."
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Founder Bio / Summary
                  </label>
                  <textarea
                    value={editingItem.bio || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
                    placeholder="Ex-systems software engineer focused on cutting developer time..."
                    rows={4}
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-sans"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full rounded-xl border border-dashed border-[#E5E4E0] bg-[#F8F7F4]/20 flex flex-col items-center justify-center p-8 text-center text-xs text-[#9B9B9B] min-h-[300px]">
              <span>Select a member on the left to edit their details, or click "Add Founder/Member".</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
