import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authenticateAdminFn, cookieHelper } from "@/lib/db";
import { Cpu } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authenticateAdminFn({ data: { email, password } });
      if (res.success && res.session) {
        // Persist session for 8 hours
        cookieHelper.set("how_admin_session", res.session, 8);
        navigate({ to: "/admin/dashboard" });
      } else {
        setError(res.error || "Incorrect email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E5E4E0] p-8 shadow-[0_4px_24px_-12px_rgba(13,13,13,0.08)]">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] mb-4">
            <Cpu size={24} />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-[#0D0D0D]">
            House Of Workflow
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1.5 font-semibold">
            Sign in to your admin panel
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded-lg bg-[#E05555]/10 border border-[#E05555]/20 p-3 text-xs font-semibold text-[#E05555] text-center">
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@houseofworkflow.com"
              required
              className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/10 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/10 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-[#3B5BDB] text-white py-3 text-sm font-semibold tracking-wide hover:bg-[#2f4bc4] disabled:opacity-50 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
