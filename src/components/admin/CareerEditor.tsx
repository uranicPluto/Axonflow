import { useState, useEffect } from "react";
import { CareerRole, getRoleFn, saveRoleFn } from "@/lib/db";
import { ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CareerEditor({ roleId }: { roleId?: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!roleId);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [team, setTeam] = useState("Engineering");
  const [location, setLocation] = useState("Pune, India (Remote-friendly)");
  const [type, setType] = useState("Full-time");
  const [salaryRange, setSalaryRange] = useState("");
  const [summary, setSummary] = useState("");
  const [about, setAbout] = useState("");
  const [open, setOpen] = useState(true);

  // Bullet Lists
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [niceToHave, setNiceToHave] = useState<string[]>([""]);

  // Load existing role
  useEffect(() => {
    if (!roleId) return;

    const loadRole = async () => {
      try {
        const role = await getRoleFn({ data: roleId });
        if (role) {
          setTitle(role.title);
          setSlug(role.slug);
          setTeam(role.team);
          setLocation(role.location);
          setType(role.type);
          setSalaryRange(role.salary_range || "");
          setSummary(role.summary);
          setAbout(role.about);
          setOpen(role.open);
          
          setResponsibilities(role.responsibilities || [""]);
          setRequirements(role.requirements || [""]);
          setNiceToHave(role.nice_to_have || [""]);
        }
      } catch (err) {
        console.error("Failed to load career role:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [roleId]);

  // Auto-slugify title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!roleId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  // Bullet list handlers
  const handleAddBullet = (listType: "resp" | "req" | "nice") => {
    if (listType === "resp") setResponsibilities([...responsibilities, ""]);
    if (listType === "req") setRequirements([...requirements, ""]);
    if (listType === "nice") setNiceToHave([...niceToHave, ""]);
  };

  const handleUpdateBullet = (listType: "resp" | "req" | "nice", idx: number, val: string) => {
    if (listType === "resp") {
      setResponsibilities(responsibilities.map((r, i) => (i === idx ? val : r)));
    }
    if (listType === "req") {
      setRequirements(requirements.map((r, i) => (i === idx ? val : r)));
    }
    if (listType === "nice") {
      setNiceToHave(niceToHave.map((r, i) => (i === idx ? val : r)));
    }
  };

  const handleRemoveBullet = (listType: "resp" | "req" | "nice", idx: number) => {
    if (listType === "resp") {
      setResponsibilities(responsibilities.filter((_, i) => i !== idx));
    }
    if (listType === "req") {
      setRequirements(requirements.filter((_, i) => i !== idx));
    }
    if (listType === "nice") {
      setNiceToHave(niceToHave.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Role Title and Slug are required!");
      return;
    }

    setSaving(true);
    // Filter out empty lines
    const payload: Partial<CareerRole> = {
      id: roleId,
      title,
      slug,
      team,
      location,
      type,
      salary_range: salaryRange,
      summary,
      about,
      responsibilities: responsibilities.map((r) => r.trim()).filter(Boolean),
      requirements: requirements.map((r) => r.trim()).filter(Boolean),
      nice_to_have: niceToHave.map((r) => r.trim()).filter(Boolean),
      open,
    };

    try {
      await saveRoleFn({ data: payload });
      navigate({ to: "/admin/careers" });
    } catch (err) {
      console.error(err);
      alert("Failed to save job posting details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading career editor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E4E0] pb-5 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/admin/careers" })}
            className="p-2 rounded-lg border border-[#E5E4E0] hover:bg-[#F8F7F4] transition text-[#6B6B6B]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">
              {roleId ? "Edit Job Role" : "New Job Role"}
            </h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Configure responsibilities, criteria, and location info.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E5E4E0] rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold">
            <span className="text-[#6B6B6B]">Hiring:</span>
            <select
              value={open ? "open" : "closed"}
              onChange={(e) => setOpen(e.target.value === "open")}
              className="bg-transparent border-none outline-none font-bold text-[#0D0D0D] cursor-pointer"
            >
              <option value="open">Open ✓</option>
              <option value="closed">Closed ✕</option>
            </select>
          </div>

          {roleId && (
            <a
              href={`/careers/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E4E0] bg-white text-[#0D0D0D] px-3.5 py-2 text-xs font-semibold hover:bg-[#F8F7F4] transition shadow-sm"
            >
              <Eye size={14} />
              <span>Preview</span>
            </a>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] disabled:opacity-50 transition shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Role"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Role specs */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            ROLE DETAILS
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. AI Automation Engineer"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. ai-automation-engineer"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Department / Team
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Engineering"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Job Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, India (Remote-friendly)"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Role Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. ₹4–8 LPA"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Job summary description
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief 1-2 sentence description summarizing the role..."
                rows={2}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                About the Role Narrative
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Provide details about role expectations, working context, and department growth..."
                rows={5}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        </div>

        {/* Repeatable Lists: Responsibilities, Requirements, Nice to Have */}
        {[
          { label: "RESPONSIBILITIES", list: responsibilities, setter: setResponsibilities, typeKey: "resp" as const },
          { label: "REQUIREMENTS & SKILLS", list: requirements, setter: setRequirements, typeKey: "req" as const },
          { label: "NICE TO HAVE (BONUS)", list: niceToHave, setter: setNiceToHave, typeKey: "nice" as const },
        ].map((listGroup) => (
          <div key={listGroup.label} className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
              {listGroup.label}
            </h3>

            <div className="space-y-3">
              {listGroup.list.map((bullet, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-[#9B9B9B] font-mono">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(listGroup.typeKey, idx, e.target.value)}
                    placeholder="Enter point detail..."
                    className="flex-grow rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBullet(listGroup.typeKey, idx)}
                    className="p-2 rounded-lg border border-[#E5E4E0] text-[#E05555] hover:bg-[#F8F7F4] transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAddBullet(listGroup.typeKey)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E5E4E0] bg-white py-2.5 text-xs font-semibold text-[#6B6B6B] hover:bg-[#F8F7F4] hover:text-[#0D0D0D] transition"
            >
              <Plus size={14} className="text-[#3B5BDB]" />
              <span>Add Bullet Point</span>
            </button>
          </div>
        ))}
      </form>
    </div>
  );
}
