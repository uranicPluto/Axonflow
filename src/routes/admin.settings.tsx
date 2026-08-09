import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSettingsFn, saveSettingsFn, saveIntegrationTogglesFn } from "@/lib/db";
import { Save, CheckCircle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingToggles, setSavingToggles] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errMessage, setErrMessage] = useState<string | null>(null);

  // Profile Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Integration Toggles
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    supabase: false,
    calendly: false,
    vapi: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettingsFn();
        setEmail(settings.email || "");
        setNotificationEmail(settings.notification_email || "");
        setWhatsappNumber(settings.whatsapp_number || "");
        
        if (settings.integration_toggles) {
          try {
            setIntegrations(JSON.parse(settings.integration_toggles));
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.error("Failed to load settings details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrMessage(null);

    if (password && password !== confirmPassword) {
      setErrMessage("Passwords do not match!");
      return;
    }

    setSavingProfile(true);
    try {
      await saveSettingsFn({
        data: {
          email,
          password: password || undefined,
          notification_email: notificationEmail,
          whatsapp_number: whatsappNumber,
        },
      });
      setPassword("");
      setConfirmPassword("");
      setMessage("Admin credentials and notifications saved successfully!");
    } catch (err) {
      console.error(err);
      setErrMessage("Failed to save settings credentials.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleIntegration = async (key: string) => {
    setSavingToggles(true);
    const updated = { ...integrations, [key]: !integrations[key] };
    setIntegrations(updated);

    try {
      await saveIntegrationTogglesFn({ data: updated });
    } catch (err) {
      console.error(err);
      // rollback
      setIntegrations(integrations);
      alert("Failed to save integration settings");
    } finally {
      setSavingToggles(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Title */}
      <div className="border-b border-[#E5E4E0] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#0D0D0D] tracking-tight">Admin Settings</h1>
        <p className="text-xs text-[#6B6B6B] mt-1">Configure credentials, webhook alerts, and active API integrations.</p>
      </div>

      {/* Success/Error alert */}
      {message && (
        <div className="rounded-xl bg-[#2EA86B]/10 border border-[#2EA86B]/20 p-4 text-xs font-semibold text-[#2EA86B] flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{message}</span>
        </div>
      )}
      {errMessage && (
        <div className="rounded-xl bg-[#E05555]/10 border border-[#E05555]/20 p-4 text-xs font-semibold text-[#E05555] flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{errMessage}</span>
        </div>
      )}

      {/* 2 Form Containers */}
      <div className="grid gap-6">
        {/* Profile and alert configuration */}
        <form onSubmit={handleSaveProfile} className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase">
              PROFILE &amp; ALERTS CONFIGURATION
            </h3>
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2 text-xs font-semibold hover:bg-[#2f4bc4] disabled:opacity-50 transition"
            >
              <Save size={12} />
              <span>{savingProfile ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Admin Sign-In Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-2.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div />

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                New Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-2.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-2.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div className="border-t border-[#E5E4E0] pt-4 sm:col-span-2 space-y-4">
              <h4 className="text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono">
                LEAD NOTIFICATION ALERTS
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                    Lead Alerts Recipient Email
                  </label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="e.g. notifications@houseofworkflow.com"
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-2.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                    WhatsApp Alert Number
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-2.5 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Integration toggles */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            INTEGRATION TOGGLES
          </h3>
          <p className="text-xs text-[#9B9B9B] leading-relaxed">
            Enable or disable external API integrations. When active, lead forms dynamically sync data to target webhooks.
          </p>

          <div className="space-y-3">
            {[
              { key: "supabase", title: "Supabase Active Database Integration", desc: "Sync leads and CMS structures directly to Supabase cloud tables rather than local fallback storage." },
              { key: "calendly", title: "Calendly Live API Synchronizations", desc: "Sync booked time coordinates automatically into lead dashboards when meetings are registered." },
              { key: "vapi", title: "Vapi AI Voice Caller Integrations", desc: "Automate outbound phone qualification pipelines and sync conversation transcripts directly." },
            ].map((integ) => (
              <div
                key={integ.key}
                className="flex items-start justify-between gap-4 p-4 border border-[#E5E4E0] bg-[#F8F7F4]/20 rounded-xl hover:border-slate-350 transition"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0D0D0D]">{integ.title}</h4>
                  <p className="text-[10px] text-[#6B6B6B] leading-relaxed max-w-[500px]">{integ.desc}</p>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => handleToggleIntegration(integ.key)}
                    disabled={savingToggles}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      integrations[integ.key] ? "bg-[#3B5BDB]" : "bg-[#E5E4E0]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        integrations[integ.key] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
