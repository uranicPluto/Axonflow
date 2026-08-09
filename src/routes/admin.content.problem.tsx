import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteContentFn, saveSiteContentFn } from "@/lib/db";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/admin/content/problem")({
  component: EditProblemSection,
});

function EditProblemSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [tagline, setTagline] = useState("");
  const [headline, setHeadline] = useState("");
  const [bodyCopy, setBodyCopy] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  
  // 4 Stats
  const [stat1Num, setStat1Num] = useState("");
  const [stat1Desc, setStat1Desc] = useState("");
  const [stat2Num, setStat2Num] = useState("");
  const [stat2Desc, setStat2Desc] = useState("");
  const [stat3Num, setStat3Num] = useState("");
  const [stat3Desc, setStat3Desc] = useState("");
  const [stat4Num, setStat4Num] = useState("");
  const [stat4Desc, setStat4Desc] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getSiteContentFn();
        setTagline(content.problem_tag || "");
        setHeadline(content.problem_headline || "");
        setBodyCopy(content.problem_body || "");
        setLinkText(content.problem_link_text || "");
        setLinkUrl(content.problem_link_url || "");
        
        setStat1Num(content.problem_stat1_num || "");
        setStat1Desc(content.problem_stat1_desc || "");
        setStat2Num(content.problem_stat2_num || "");
        setStat2Desc(content.problem_stat2_desc || "");
        setStat3Num(content.problem_stat3_num || "");
        setStat3Desc(content.problem_stat3_desc || "");
        setStat4Num(content.problem_stat4_num || "");
        setStat4Desc(content.problem_stat4_desc || "");
      } catch (err) {
        console.error("Failed to load problem section CMS:", err);
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
        saveSiteContentFn({ data: { key: "problem_tag", value: tagline } }),
        saveSiteContentFn({ data: { key: "problem_headline", value: headline } }),
        saveSiteContentFn({ data: { key: "problem_body", value: bodyCopy } }),
        saveSiteContentFn({ data: { key: "problem_link_text", value: linkText } }),
        saveSiteContentFn({ data: { key: "problem_link_url", value: linkUrl } }),
        
        saveSiteContentFn({ data: { key: "problem_stat1_num", value: stat1Num } }),
        saveSiteContentFn({ data: { key: "problem_stat1_desc", value: stat1Desc } }),
        saveSiteContentFn({ data: { key: "problem_stat2_num", value: stat2Num } }),
        saveSiteContentFn({ data: { key: "problem_stat2_desc", value: stat2Desc } }),
        saveSiteContentFn({ data: { key: "problem_stat3_num", value: stat3Num } }),
        saveSiteContentFn({ data: { key: "problem_stat3_desc", value: stat3Desc } }),
        saveSiteContentFn({ data: { key: "problem_stat4_num", value: stat4Num } }),
        saveSiteContentFn({ data: { key: "problem_stat4_desc", value: stat4Desc } }),
      ]);
      navigate({ to: "/admin/content" });
    } catch (err) {
      console.error(err);
      alert("Failed to save problem section details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading problem CMS...</div>
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
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">Edit Problem Section</h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Edit status-quo statistics and narrative descriptions.</p>
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
            NARRATIVE DETAIL
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Section tag title
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="THE COST OF THE STATUS QUO"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Section Headline
              </label>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Thousands of hours a year, spent on work..."
                rows={2}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Body Narrative Copy
              </label>
              <textarea
                value={bodyCopy}
                onChange={(e) => setBodyCopy(e.target.value)}
                placeholder="It rarely looks like a crisis..."
                rows={5}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                  Action Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Read how we solve this"
                  required
                  className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                  Action Link URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/services"
                  required
                  className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 statistics cards */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            GRID STATISTICS CALLOUTS (4 ITEMS)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { num: stat1Num, setNum: setStat1Num, desc: stat1Desc, setDesc: setStat1Desc, index: 1 },
              { num: stat2Num, setNum: setStat2Num, desc: stat2Desc, setDesc: setStat2Desc, index: 2 },
              { num: stat3Num, setNum: setStat3Num, desc: stat3Desc, setDesc: setStat3Desc, index: 3 },
              { num: stat4Num, setNum: setStat4Num, desc: stat4Desc, setDesc: setStat4Desc, index: 4 },
            ].map((stat) => (
              <div key={stat.index} className="border border-[#E5E4E0] rounded-xl p-4 bg-[#F8F7F4]/30 space-y-3">
                <span className="block text-[10px] font-bold tracking-wider text-[#9B9B9B] uppercase font-mono">
                  STAT CARD #{stat.index}
                </span>
                <div>
                  <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Highlight Metric (e.g. 31%)</label>
                  <input
                    type="text"
                    value={stat.num}
                    onChange={(e) => stat.setNum(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E4E0] bg-white px-3 py-1.5 text-xs font-bold text-[#3B5BDB] focus:border-[#3B5BDB]/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-[#6B6B6B] font-bold uppercase font-mono mb-1">Description Label</label>
                  <textarea
                    value={stat.desc}
                    onChange={(e) => stat.setDesc(e.target.value)}
                    required
                    rows={2}
                    className="w-full rounded-lg border border-[#E5E4E0] bg-white p-2.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 font-sans"
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
