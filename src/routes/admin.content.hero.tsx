import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteContentFn, saveSiteContentFn } from "@/lib/db";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/admin/content/hero")({
  component: EditHeroSection,
});

function EditHeroSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [tagline, setTagline] = useState("");
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [cta1Text, setCta1Text] = useState("");
  const [cta1Url, setCta1Url] = useState("");
  const [cta2Text, setCta2Text] = useState("");
  const [cta2Url, setCta2Url] = useState("");
  const [stat1Num, setStat1Num] = useState("");
  const [stat1Label, setStat1Label] = useState("");
  const [stat2Num, setStat2Num] = useState("");
  const [stat2Label, setStat2Label] = useState("");
  const [stat3Num, setStat3Num] = useState("");
  const [stat3Label, setStat3Label] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getSiteContentFn();
        setTagline(content.hero_tag || "");
        setHeadline(content.hero_headline || "");
        setSubheadline(content.hero_subheadline || "");
        setCta1Text(content.hero_cta1_text || "");
        setCta1Url(content.hero_cta1_url || "");
        setCta2Text(content.hero_cta2_text || "");
        setCta2Url(content.hero_cta2_url || "");
        setStat1Num(content.hero_stat1_num || "");
        setStat1Label(content.hero_stat1_label || "");
        setStat2Num(content.hero_stat2_num || "");
        setStat2Label(content.hero_stat2_label || "");
        setStat3Num(content.hero_stat3_num || "");
        setStat3Label(content.hero_stat3_label || "");
      } catch (err) {
        console.error("Failed to load hero CMS settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await Promise.all([
        saveSiteContentFn({ data: { key: "hero_tag", value: tagline } }),
        saveSiteContentFn({ data: { key: "hero_headline", value: headline } }),
        saveSiteContentFn({ data: { key: "hero_subheadline", value: subheadline } }),
        saveSiteContentFn({ data: { key: "hero_cta1_text", value: cta1Text } }),
        saveSiteContentFn({ data: { key: "hero_cta1_url", value: cta1Url } }),
        saveSiteContentFn({ data: { key: "hero_cta2_text", value: cta2Text } }),
        saveSiteContentFn({ data: { key: "hero_cta2_url", value: cta2Url } }),
        saveSiteContentFn({ data: { key: "hero_stat1_num", value: stat1Num } }),
        saveSiteContentFn({ data: { key: "hero_stat1_label", value: stat1Label } }),
        saveSiteContentFn({ data: { key: "hero_stat2_num", value: stat2Num } }),
        saveSiteContentFn({ data: { key: "hero_stat2_label", value: stat2Label } }),
        saveSiteContentFn({ data: { key: "hero_stat3_num", value: stat3Num } }),
        saveSiteContentFn({ data: { key: "hero_stat3_label", value: stat3Label } }),
      ]);
      navigate({ to: "/admin/content" });
    } catch (err) {
      console.error(err);
      alert("Failed to save hero section edits.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading hero CMS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">Edit Hero Section</h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Customize headings, support summaries, and CTA configurations.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] disabled:opacity-50 transition shadow-sm"
        >
          <Save size={14} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core details */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            HERO NARRATIVE
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Tag line (Small caps)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="WEB DEVELOPMENT & AI AUTOMATION"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Main Headline
              </label>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your business should not run on manual work."
                rows={2}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Subheadline Paragraph
              </label>
              <textarea
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="We build high-performance websites..."
                rows={4}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            CALL TO ACTIONS (CTAS)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[#E5E4E0] rounded-xl p-4 bg-[#F8F7F4]/30 space-y-3">
              <span className="block text-[10px] font-bold tracking-wider text-[#9B9B9B] uppercase font-mono">PRIMARY BUTTON</span>
              <div>
                <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Text</label>
                <input
                  type="text"
                  value={cta1Text}
                  onChange={(e) => setCta1Text(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Link URL</label>
                <input
                  type="text"
                  value={cta1Url}
                  onChange={(e) => setCta1Url(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="border border-[#E5E4E0] rounded-xl p-4 bg-[#F8F7F4]/30 space-y-3">
              <span className="block text-[10px] font-bold tracking-wider text-[#9B9B9B] uppercase font-mono">SECONDARY BUTTON</span>
              <div>
                <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Text</label>
                <input
                  type="text"
                  value={cta2Text}
                  onChange={(e) => setCta2Text(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Link URL</label>
                <input
                  type="text"
                  value={cta2Url}
                  onChange={(e) => setCta2Url(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero metrics stats */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            HERO METRICS STATS (THREE CARD COLUMNS)
          </h3>
          <div className="space-y-4">
            {[
              { num: stat1Num, setNum: setStat1Num, lbl: stat1Label, setLbl: setStat1Label, index: 1 },
              { num: stat2Num, setNum: setStat2Num, lbl: stat2Label, setLbl: setStat2Label, index: 2 },
              { num: stat3Num, setNum: setStat3Num, lbl: stat3Label, setLbl: setStat3Label, index: 3 },
            ].map((stat) => (
              <div key={stat.index} className="grid gap-3 sm:grid-cols-3 border border-[#E5E4E0] rounded-xl p-4 bg-[#F8F7F4]/30 items-center">
                <span className="text-[10px] font-bold tracking-wider text-[#9B9B9B] uppercase font-mono">
                  Metric Column #{stat.index}
                </span>
                <div>
                  <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Value (e.g. 40%)</label>
                  <input
                    type="text"
                    value={stat.num}
                    onChange={(e) => stat.setNum(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs font-bold text-[#3B5BDB] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Description Label</label>
                  <input
                    type="text"
                    value={stat.lbl}
                    onChange={(e) => stat.setLbl(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
