import React, { useState, useEffect } from "react";
import { Lead, LeadActivity } from "../../server/db";
import { getLeadTimelineFn, updateLeadQualificationFn, addLeadNoteFn, issueCsrfTokenFn } from "../../lib/db";
import { X, Calendar, Phone, Mail, Clock, ShieldCheck, Tag, DollarSign, Award, Send, CheckCircle2 } from "lucide-react";

interface LeadWorkspaceModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadWorkspaceModal: React.FC<LeadWorkspaceModalProps> = ({ lead, onClose, onLeadUpdated }) => {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>(lead?.status || "new");
  const [leadScore, setLeadScore] = useState<number>(lead?.lead_score || 50);
  const [budgetSignal, setBudgetSignal] = useState<string>(lead?.budget_signal || "");
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status || "new");
      setLeadScore(lead.lead_score || 50);
      setBudgetSignal(lead.budget_signal || "");
      fetchTimeline(lead.id);
      fetchCsrfToken();
    }
  }, [lead]);

  const fetchCsrfToken = async () => {
    try {
      const res = await issueCsrfTokenFn();
      if (res && res.token) {
        setCsrfToken(res.token);
      }
    } catch {
      // Fallback
    }
  };

  const fetchTimeline = async (leadId: string) => {
    setIsLoading(true);
    try {
      const res = await getLeadTimelineFn({ data: leadId });
      setActivities(res || []);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    setStatus(newStatus);
    setIsSaving(true);
    try {
      await updateLeadQualificationFn({
        data: {
          leadId: lead.id,
          qualificationData: {
            status: newStatus,
            lead_score: leadScore,
            budget_signal: budgetSignal,
          },
        },
      });
      showNotification(`Lead status updated to ${newStatus}`);
      fetchTimeline(lead.id);
      onLeadUpdated();
    } catch (err: any) {
      showNotification(`Failed to update status: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleScoreChange = async (score: number) => {
    if (!lead) return;
    setLeadScore(score);
    setIsSaving(true);
    try {
      await updateLeadQualificationFn({
        data: {
          leadId: lead.id,
          qualificationData: {
            status: status,
            lead_score: score,
            budget_signal: budgetSignal,
          },
        },
      });
      showNotification(`Lead score updated to ${score}/100`);
      fetchTimeline(lead.id);
      onLeadUpdated();
    } catch (err: any) {
      showNotification(`Failed to update score: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;

    setIsSaving(true);
    try {
      await addLeadNoteFn({
        data: {
          leadId: lead.id,
          note: newNote.trim(),
        },
      });
      setNewNote("");
      showNotification("Internal note recorded successfully");
      fetchTimeline(lead.id);
      onLeadUpdated();
    } catch (err: any) {
      showNotification(`Failed to add note: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
              {lead.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  status === "won" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  status === "qualified" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" :
                  status === "in_progress" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                  "bg-slate-800 text-slate-300"
                }`}>
                  {status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-6 py-2.5 text-sm text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            {notification}
          </div>
        )}

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Qualification Controls & Details */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status Transition Card */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Qualification Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isSaving}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="new">NEW (Unassigned)</option>
                <option value="in_progress">IN PROGRESS (Contacted)</option>
                <option value="call_opted_in">CALL OPTED-IN</option>
                <option value="qualified">QUALIFIED</option>
                <option value="proposal_sent">PROPOSAL SENT</option>
                <option value="won">WON (Deal Closed)</option>
                <option value="lost">LOST</option>
              </select>
            </div>

            {/* Lead Score Selector */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Lead Score
                </label>
                <span className="text-sm font-bold text-amber-400">{leadScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={leadScore}
                onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                disabled={isSaving}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Service & Problem Description */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inquiry Context</h4>
              <div>
                <span className="text-xs text-slate-500">Service Interest:</span>
                <p className="text-sm font-medium text-slate-200 capitalize">{lead.service_interest?.replace("_", " ") || "Not Specified"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Problem Description:</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  {lead.problem_description || "No specific details provided."}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Timeline & Notes Input */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            
            {/* Add Internal Note */}
            <form onSubmit={handleAddNote} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" /> Record Activity Note
              </label>
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter internal diagnostic notes, call summary, or follow-up details..."
                  rows={2}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSaving || !newNote.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>

            {/* Interaction Timeline */}
            <div className="flex-1 bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Activity Timeline
              </h3>

              {isLoading ? (
                <div className="py-8 text-center text-slate-500 text-sm">Loading activity history...</div>
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">No activity recorded for this lead yet.</div>
              ) : (
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-800 ml-2">
                  {activities.map((act) => (
                    <div key={act.id} className="relative">
                      {/* Circle indicator */}
                      <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        act.activity_type === "intake_created" ? "bg-indigo-500" :
                        act.activity_type === "call_requested" ? "bg-emerald-500" :
                        act.activity_type === "status_changed" ? "bg-amber-500" :
                        "bg-slate-600"
                      }`} />
                      
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-indigo-400 capitalize">{act.activity_type.replace("_", " ")}</span>
                          <span className="text-[10px] text-slate-500">{new Date(act.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-200">{act.description}</p>
                        <div className="text-[10px] text-slate-500">By: {act.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-xs text-slate-500">
          <span>Lead ID: {lead.id}</span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium">
            Close Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
