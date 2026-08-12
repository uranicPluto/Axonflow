import { createFileRoute, Link, Outlet, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { checkAdminAuthFn, cookieHelper, getAdminSessionCookieFn, getLeadsFn, getPostsFn } from "@/lib/db";
import { Cpu, LayoutDashboard, Users, Activity, Sliders, LogOut, ChevronRight, Menu, X, Globe, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location, cause }) => {
    // This runs on both server and client before loading admin routes
    let isAuthenticated = false;
    let token: string | null = null;

    try {
      if (typeof document !== "undefined") {
        token = cookieHelper.get("how_admin_session");
      } else {
        token = await getAdminSessionCookieFn();
      }

      if (token) {
        isAuthenticated = await checkAdminAuthFn({ data: token });
      }
    } catch (err) {
      console.warn("Failed to check admin authentication on server:", err);
    }

    const isLoginPath = location.pathname === "/admin/login";

    if (!isAuthenticated && !isLoginPath) {
      throw redirect({ to: "/admin/login" });
    }

    if (isAuthenticated && isLoginPath) {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [blogDraftsCount, setBlogDraftsCount] = useState(0);
  const isLoginPage = location.pathname === "/admin/login";

  // Check auth client side on mount/update
  useEffect(() => {
    const token = cookieHelper.get("how_admin_session");
    if (!token && !isLoginPage) {
      navigate({ to: "/admin/login" });
    }
  }, [location.pathname, navigate, isLoginPage]);

  // Fetch badges count (Leads and Blogs)
  useEffect(() => {
    if (isLoginPage) return;

    const fetchCounts = async () => {
      try {
        const leads = await getLeadsFn();
        const posts = await getPostsFn();
        setNewLeadsCount(leads.filter((l) => l.status === "new").length);
        setBlogDraftsCount(posts.filter((p) => p.status === "draft").length);
      } catch (err) {
        console.error("Failed to load badge counts:", err);
      }
    };

    fetchCounts();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isLoginPage]);

  const handleSignOut = () => {
    cookieHelper.delete("how_admin_session");
    navigate({ to: "/admin/login" });
  };

  if (isLoginPage) {
    return (
      <div className="admin-portal min-h-screen bg-[#F8F7F4] text-[#0D0D0D]">
        <style dangerouslySetInnerHTML={{ __html: cursorStyles }} />
        <Outlet />
      </div>
    );
  }

  const navItems = [
    { section: "OVERVIEW", items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    ] },
    {
      section: "LEADS",
      items: [
        { label: "Inbox", to: "/admin/leads", icon: Users, badge: newLeadsCount > 0 ? newLeadsCount : undefined },
      ],
    },
    {
      section: "CONTENT",
      items: [
        { label: "Blog", to: "/admin/blog", icon: Activity, badge: blogDraftsCount > 0 ? blogDraftsCount : undefined },
        { label: "Portfolio", to: "/admin/portfolio", icon: Sliders },
        { label: "Careers", to: "/admin/careers", icon: Users },
      ],
    },
    {
      section: "SITE EDITOR",
      items: [
        { label: "Homepage", to: "/admin/content/hero", icon: Sliders },
        { label: "Services", to: "/admin/content/services", icon: Sliders },
        { label: "FAQ", to: "/admin/content/faq", icon: Sliders },
        { label: "Testimonials", to: "/admin/content/testimonials", icon: Sliders },
        { label: "Footer", to: "/admin/content/footer", icon: Sliders },
      ],
    },
    {
      section: "ACCOUNT",
      items: [
        { label: "Settings", to: "/admin/settings", icon: Sliders },
      ],
    },
  ];

  return (
    <div className="admin-portal min-h-screen bg-[#F8F7F4] text-[#0D0D0D] flex flex-col md:flex-row antialiased font-sans">
      <style dangerouslySetInnerHTML={{ __html: cursorStyles }} />

      {/* Mobile Top Bar */}
      <header className="md:hidden flex h-16 items-center justify-between border-b border-[#E5E4E0] bg-white px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B5BDB]/10 text-[#3B5BDB]">
            <Cpu size={18} />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#0D0D0D] font-display">
            House Of Workflow
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E4E0] hover:bg-[#F8F7F4] transition"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[#E5E4E0] bg-white transition-transform duration-300 w-[240px] md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E5E4E0] px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B5BDB]/10 text-[#3B5BDB]">
              <Cpu size={18} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#0D0D0D] font-display">
              House Of Workflow
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navItems.map((group) => (
            <div key={group.section} className="space-y-1">
              <span className="block px-2 text-[9px] font-bold tracking-[0.07em] text-[#9B9B9B] uppercase font-mono">
                {group.section}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#3B5BDB]/10 text-[#3B5BDB] shadow-[0_1px_3px_rgba(59,91,219,0.05)]"
                        : "text-[#6B6B6B] hover:bg-[#F8F7F4] hover:text-[#0D0D0D]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className={isActive ? "text-[#3B5BDB]" : "text-[#9B9B9B]"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-[#E05555] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Sign Out Navigation */}
          <div className="space-y-1 pt-6 border-t border-[#E5E4E0]">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#E05555] hover:bg-[#E05555]/10 transition"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#E5E4E0] p-4 text-[10px] text-[#9B9B9B] font-mono flex items-center justify-between">
          <span>v1.0 (Stable)</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2EA86B] animate-pulse" />
            Live Admin
          </span>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E4E0] bg-[#F8F7F4]/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-[#0D0D0D] tracking-tight font-display capitalize">
              {location.pathname.split("/").pop() || "Admin Portal"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#3B5BDB] font-semibold transition"
            >
              <span>View live site</span>
              <Globe size={12} />
            </a>
            <div className="h-8 w-8 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center text-xs font-bold font-mono">
              JM
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-grow p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Global cursors overrides to bypass the public site custom cursor inside admin
const cursorStyles = `
  .admin-portal,
  .admin-portal * {
    cursor: default !important;
  }
  .admin-portal a,
  .admin-portal button,
  .admin-portal [role="button"],
  .admin-portal select,
  .admin-portal input[type="submit"],
  .admin-portal input[type="button"] {
    cursor: pointer !important;
  }
  .admin-portal input,
  .admin-portal textarea {
    cursor: text !important;
  }
`;
