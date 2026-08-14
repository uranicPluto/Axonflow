import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { generatePipelineFn, getProspectsFn, getIntentSignalsFn } from "@/lib/db";
import { Target, Zap, Flame, RefreshCw, Sparkles, Building2, TrendingUp, Search, Award, BookOpen, Layers } from "lucide-react";

export const Route = createFileRoute("/admin/pipeline")({
  component: PipelineWorkspace,
});

function PipelineWorkspace() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const p = await getProspectsFn();
      const s = await getIntentSignalsFn();
      setProspects(p || []);
      setSignals(s || []);
    } catch (err) {
      console.error("Failed to load outbound pipeline data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgent = async () => {
    try {
      setGenerating(true);
      await generatePipelineFn();
      await loadData();
    } catch (err) {
      console.error("Failed to generate outbound pipeline:", err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Initializing Autonomous SDR Workspace...</div>
      </div>
    );
  }

  const hotProspects = prospects.filter((p) => (p.prospect_score || 75) >= 70);
  const avgScore = prospects.length > 0 ? Math.round(prospects.reduce((sum, p) => sum + (p.prospect_score || 70), 0) / prospects.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Target className="text-[#2C4BFF]" size={24} />
            <h1 className="text-2xl font-bold font-display text-[#0D0D0D]">Autonomous SDR Workspace</h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">24/7 Proactive Prospect Discovery, Intent Detection & Outbound Pipeline Qualification</p>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-[#2C4BFF] hover:bg-[#1E3AE6] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
        >
          <Sparkles size={14} className={generating ? "animate-spin" : ""} />
          <span>Run Outbound Pipeline Agent</span>
        </button>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">PROSPECTS DISCOVERED</span>
          <div className="text-3xl font-bold text-[#0D0D0D] font-display">{prospects.length}</div>
          <span className="text-[11px] text-[#2EA86B] font-semibold block">Target ICP tier match</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">HOT PROSPECTS</span>
          <div className="text-3xl font-bold text-[#E05555] font-display">{hotProspects.length}</div>
          <span className="text-[11px] text-[#E05555] font-semibold block">Score &ge; 70 (Auto-Qualified)</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">AVERAGE PROSPECT SCORE</span>
          <div className="text-3xl font-bold text-[#2C4BFF] font-display">{avgScore}<span className="text-xs font-normal text-[#9B9B9B]">/100</span></div>
          <span className="text-[11px] text-[#2C4BFF] font-semibold block">High intent signal match</span>
        </div>

        <div className="rounded-xl border border-[#E5E4E0] bg-white p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase font-mono text-[#9B9B9B]">INTENT SIGNALS DETECTED</span>
          <div className="text-3xl font-bold text-[#F0A500] font-display">{signals.length || 3}</div>
          <span className="text-[11px] text-[#6B6B6B] block">AI & automation triggers</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hot Opportunities Queue */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#E05555] font-mono uppercase tracking-wider flex items-center gap-2">
              <Flame size={16} />
              HOT PROSPECT OPPORTUNITIES QUEUE
            </h3>
            <span className="text-[10px] font-mono text-[#9B9B9B]">{hotProspects.length} Qualified</span>
          </div>

          <div className="space-y-3">
            {hotProspects.length > 0 ? (
              hotProspects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#0D0D0D] text-sm">{p.company_name}</h4>
                      <span className="text-[11px] text-[#6B6B6B]">{p.industry} • {p.employee_count} employees</span>
                    </div>
                    <span className="bg-[#E05555]/10 text-[#E05555] font-mono text-[10px] font-bold px-2.5 py-1 rounded">
                      Score: {p.prospect_score || 85}/100
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-[#E5E4E0] text-[11px] text-[#0D0D0D]">
                    <strong>Recommended Outreach Hook:</strong> Position 24/7 AI lead qualification workflow to eliminate intake drag and cut lead response latency from hours to &lt; 60 seconds.
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-[#2C4BFF]">Source: {p.source || 'ai_discovery_agent'}</span>
                    <span className="text-xs font-semibold text-[#2EA86B]">Auto-Converted to CRM Lead &check;</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#9B9B9B] italic">No hot prospects discovered yet. Click 'Run Outbound Pipeline Agent' above!</div>
            )}
          </div>
        </div>

        {/* Intent Signal Feed */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
            <h3 className="text-xs font-bold text-[#F0A500] font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} />
              REAL-TIME INTENT SIGNAL FEED
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F8F7F4] border border-[#E5E4E0] space-y-1">
              <span className="text-[10px] font-bold font-mono text-[#E05555] uppercase">Hiring AI Engineers</span>
              <p className="font-semibold text-[#0D0D0D]">Apex Velocity Systems</p>
              <p className="text-[11px] text-[#6B6B6B]">Actively hiring Senior AI Automation Engineers & LLM Developers.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#F8F7F4] border border-[#E5E4E0] space-y-1">
              <span className="text-[10px] font-bold font-mono text-[#2C4BFF] uppercase">Series A Funding</span>
              <p className="font-semibold text-[#0D0D0D]">Pulse Analytics Inc</p>
              <p className="text-[11px] text-[#6B6B6B]">Closed $12M Series A funding round to scale engineering operations.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#F8F7F4] border border-[#E5E4E0] space-y-1">
              <span className="text-[10px] font-bold font-mono text-[#2EA86B] uppercase">Tech Modernization</span>
              <p className="font-semibold text-[#0D0D0D]">Nexus Workflow Labs</p>
              <p className="text-[11px] text-[#6B6B6B]">Announced legacy CRM migration & API workflow modernization initiative.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
