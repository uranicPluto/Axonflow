import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sliders, HelpCircle, FileText, Users, MessageSquare, Clipboard } from "lucide-react";

export const Route = createFileRoute("/admin/content/")({
  component: ContentOverview,
});

function ContentOverview() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Hero Section",
      description: "Edit headlines, small caps tags, subheadline paragraphs, and primary CTAs.",
      to: "/admin/content/hero",
      icon: Sliders,
      color: "text-[#3B5BDB] bg-[#3B5BDB]/5",
    },
    {
      title: "Problem Section",
      description: "Edit the 'Cost of Status Quo' descriptions and the four key statistics grids.",
      to: "/admin/content/problem",
      icon: FileText,
      color: "text-[#E05555] bg-[#E05555]/5",
    },
    {
      title: "Services List",
      description: "Manage core service pillars, bullet specifications, and stats callouts.",
      to: "/admin/content/services",
      icon: Clipboard,
      color: "text-[#2EA86B] bg-[#2EA86B]/5",
    },
    {
      title: "Team Members",
      description: "Manage founder details, roles, bios, and LinkedIn profile links.",
      to: "/admin/content/team",
      icon: Users,
      color: "text-[#A06EFF] bg-[#A06EFF]/5",
    },
    {
      title: "FAQ Accordion",
      description: "Configure typical client buyer questions, answers, and sort orders.",
      to: "/admin/content/faq",
      icon: HelpCircle,
      color: "text-[#F0A500] bg-[#F0A500]/5",
    },
    {
      title: "Testimonials",
      description: "Publish quotes, executive titles, and corporate company tags.",
      to: "/admin/content/testimonials",
      icon: MessageSquare,
      color: "text-[#6B6B6B] bg-[#F8F7F4]",
    },
    {
      title: "Footer Content",
      description: "Configure email addresses, office locations, social profiles, and copyrights.",
      to: "/admin/content/footer",
      icon: Clipboard,
      color: "text-[#0D0D0D] bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#E5E4E0] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#0D0D0D] tracking-tight">Homepage Site CMS</h1>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Select a homepage component card below to edit its content dynamically without code.
        </p>
      </div>

      {/* Grid of section cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.title}
              onClick={() => navigate({ to: section.to })}
              className="group rounded-xl border border-[#E5E4E0] bg-white p-6 hover:border-slate-350 transition hover:shadow-sm flex flex-col items-start text-left gap-4"
            >
              <div className={`p-3 rounded-xl transition ${section.color}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-sm font-bold text-[#0D0D0D] group-hover:text-[#3B5BDB] transition">
                  {section.title}
                </h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {section.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
