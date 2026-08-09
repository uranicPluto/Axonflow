import { useState, useEffect } from "react";
import { Project, getProjectFn, saveProjectFn } from "@/lib/db";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CaseStudyEditor({ projectId }: { projectId?: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [industryTag, setIndustryTag] = useState("");
  const [serviceTag, setServiceTag] = useState("AI Automation");
  const [contextBody, setContextBody] = useState("");
  const [result1Value, setResult1Value] = useState("");
  const [result1Label, setResult1Label] = useState("");
  const [result2Value, setResult2Value] = useState("");
  const [result2Label, setResult2Label] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [sortOrder, setSortOrder] = useState(99);
  const [published, setPublished] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Load existing project if editing
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        const proj = await getProjectFn({ data: projectId });
        if (proj) {
          setTitle(proj.title);
          setSlug(proj.slug);
          setIndustryTag(proj.industry_tag || "");
          setServiceTag(proj.service_tag || "AI Automation");
          setContextBody(proj.context_body || "");
          setResult1Value(proj.result_1_value || "");
          setResult1Label(proj.result_1_label || "");
          setResult2Value(proj.result_2_value || "");
          setResult2Label(proj.result_2_label || "");
          setImageUrl(proj.image_url || "");
          setImageAlt(proj.image_alt || "");
          setSortOrder(proj.sort_order);
          setPublished(proj.published);
          setSeoTitle(proj.seo_title || "");
          setSeoDescription(proj.seo_description || "");
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Auto-slugify headline
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!projectId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Headline Title and Slug are required!");
      return;
    }

    setSaving(true);
    const payload: Partial<Project> = {
      id: projectId,
      title,
      slug,
      industry_tag: industryTag,
      service_tag: serviceTag,
      context_body: contextBody,
      result_1_value: result1Value,
      result_1_label: result1Label,
      result_2_value: result2Value,
      result_2_label: result2Label,
      image_url: imageUrl,
      image_alt: imageAlt || title,
      sort_order: sortOrder,
      published,
      seo_title: seoTitle || title,
      seo_description: seoDescription || contextBody.slice(0, 150),
    };

    try {
      await saveProjectFn({ data: payload });
      navigate({ to: "/admin/portfolio" });
    } catch (err) {
      console.error(err);
      alert("Failed to save case study details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading case study editor...</div>
      </div>
    );
  }

  const serviceOptions = [
    "AI Automation",
    "Web Development",
    "Business Process Automation",
    "GTM Engineering",
    "CRM Engineering",
    "Custom Software",
    "SaaS Development",
    "AI Agents",
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E4E0] pb-5 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/admin/portfolio" })}
            className="p-2 rounded-lg border border-[#E5E4E0] hover:bg-[#F8F7F4] transition text-[#6B6B6B]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">
              {projectId ? "Edit Case Study" : "New Case Study"}
            </h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Configure metrics and context blocks for the portfolio.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E5E4E0] rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold">
            <span className="text-[#6B6B6B]">Status:</span>
            <select
              value={published ? "published" : "draft"}
              onChange={(e) => setPublished(e.target.value === "published")}
              className="bg-transparent border-none outline-none font-bold text-[#0D0D0D] cursor-pointer"
            >
              <option value="draft">Draft ⏱</option>
              <option value="published">Published ✓</option>
            </select>
          </div>

          {projectId && (
            <a
              href={`/case-studies/${slug}`}
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
            <span>{saving ? "Saving..." : "Save Study"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Case study details */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            CASE STUDY DETAILS
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Lead qualification time cut from 72 hours to 4 hours"
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
                placeholder="e.g. saas-trial-qualification"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Industry Tag
              </label>
              <input
                type="text"
                value={industryTag}
                onChange={(e) => setIndustryTag(e.target.value)}
                placeholder="e.g. SAAS STARTUP"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Service Focus
              </label>
              <select
                value={serviceTag}
                onChange={(e) => setServiceTag(e.target.value)}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              >
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Reorder Sorting Value
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 99)}
                placeholder="99"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Context Narrative Body
              </label>
              <textarea
                value={contextBody}
                onChange={(e) => setContextBody(e.target.value)}
                placeholder="Write the background story: the client's problem, what was built, and how it automated operations..."
                rows={6}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        </div>

        {/* Results Metrics */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            RESULT METRICS (KEY PERFORMANCE OUTCOMES)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 border border-[#E5E4E0] rounded-xl p-4 bg-[#F8F7F4]/30">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Metric 1 — Value Highlight
              </label>
              <input
                type="text"
                value={result1Value}
                onChange={(e) => setResult1Value(e.target.value)}
                placeholder="e.g. 4 hrs"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] font-bold focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Metric 1 — Detailed Label
              </label>
              <input
                type="text"
                value={result1Label}
                onChange={(e) => setResult1Label(e.target.value)}
                placeholder="e.g. Qualification time (was 72 hrs)"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border border-[#E5E4E0] rounded-xl p-4 bg-[#F8F7F4]/30">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Metric 2 — Value Highlight
              </label>
              <input
                type="text"
                value={result2Value}
                onChange={(e) => setResult2Value(e.target.value)}
                placeholder="e.g. 3.2x"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] font-bold focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Metric 2 — Detailed Label
              </label>
              <input
                type="text"
                value={result2Label}
                onChange={(e) => setResult2Label(e.target.value)}
                placeholder="e.g. More demos booked per week"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Project assets */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            PROJECT MEDIA &amp; MOCKUPS
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Image Source URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/... or leave blank"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Image Alt Description
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="e.g. Clearbound trial automation flow diagrams"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* SEO settings */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            SEO META TARGETS
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                SEO Headline Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "Defaults to headline"}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                SEO Snippet Description
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={contextBody ? contextBody.slice(0, 150) : "Defaults to context summary"}
                rows={2}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
