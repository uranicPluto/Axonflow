import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteContentFn, saveSiteContentFn } from "@/lib/db";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/admin/content/footer")({
  component: EditFooterSection,
});

function EditFooterSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [copyright, setCopyright] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getSiteContentFn();
        setEmail(content.footer_email || "");
        setOfficeLocation(content.footer_office || "");
        setSocialTwitter(content.footer_social_twitter || "");
        setSocialLinkedin(content.footer_social_linkedin || "");
        setSocialGithub(content.footer_social_github || "");
        setCopyright(content.footer_copyright || "");
      } catch (err) {
        console.error("Failed to load footer CMS:", err);
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
        saveSiteContentFn({ data: { key: "footer_email", value: email } }),
        saveSiteContentFn({ data: { key: "footer_office", value: officeLocation } }),
        saveSiteContentFn({ data: { key: "footer_social_twitter", value: socialTwitter } }),
        saveSiteContentFn({ data: { key: "footer_social_linkedin", value: socialLinkedin } }),
        saveSiteContentFn({ data: { key: "footer_social_github", value: socialGithub } }),
        saveSiteContentFn({ data: { key: "footer_copyright", value: copyright } }),
      ]);
      navigate({ to: "/admin/content" });
    } catch (err) {
      console.error(err);
      alert("Failed to save footer configurations.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading footer CMS...</div>
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
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">Edit Footer</h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Customize global site coordinates, links, and legal footers.</p>
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
        {/* Contact coordinates */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            GLOBAL COORDINATES
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Contact Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hello@houseofworkflow.com"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Office / Location Details
              </label>
              <input
                type="text"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                placeholder="e.g. Pune, India"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Social channels */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            SOCIAL CHANNELS
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={socialLinkedin}
                onChange={(e) => setSocialLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Twitter/X URL
              </label>
              <input
                type="url"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={socialGithub}
                onChange={(e) => setSocialGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            LEGAL FOOTER
          </h3>
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
              Copyright Notice Text
            </label>
            <input
              type="text"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              placeholder="e.g. © 2026 House of Workflow. All rights reserved."
              required
              className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
