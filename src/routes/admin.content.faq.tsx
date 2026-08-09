import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFaqsFn, saveFaqFn, deleteFaqFn, FaqItem } from "@/lib/db";
import { ArrowLeft, Plus, Trash2, Edit3, Save } from "lucide-react";

export const Route = createFileRoute("/admin/content/faq")({
  component: EditFaqSection,
});

function EditFaqSection() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Editor State
  const [editingItem, setEditingItem] = useState<Partial<FaqItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadFaqs = async () => {
    try {
      const data = await getFaqsFn();
      setFaqs(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      console.error("Failed to load FAQs database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleAddNew = () => {
    setEditingItem({
      question: "",
      answer: "",
      sort_order: faqs.length + 1,
      published: true,
    });
  };

  const handleEdit = (item: FaqItem) => {
    setEditingItem(item);
  };

  const handleDelete = async (id: string, question: string) => {
    const previewText = question.length > 30 ? question.slice(0, 30) + "..." : question;
    if (window.confirm(`Are you sure you want to delete the FAQ "${previewText}"?`)) {
      try {
        await deleteFaqFn({ data: id });
        loadFaqs();
        if (editingItem?.id === id) setEditingItem(null);
      } catch (err) {
        console.error(err);
        alert("Failed to delete FAQ item");
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.question || !editingItem?.answer) {
      alert("Question and Answer are required fields!");
      return;
    }

    setSaving(true);
    try {
      await saveFaqFn({ data: editingItem });
      setEditingItem(null);
      loadFaqs();
    } catch (err) {
      console.error(err);
      alert("Failed to save FAQ item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading FAQ database...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">Edit FAQ Accordion</h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Manage typical buyer inquiries, responses, and reorder ranks.</p>
          </div>
        </div>

        {!editingItem && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] transition shadow-sm"
          >
            <Plus size={14} />
            <span>Add New FAQ</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — FAQs list */}
        <div className="space-y-3 lg:col-span-1">
          <span className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-2">
            ACCORDION QUESTIONS LIST
          </span>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              onClick={() => handleEdit(faq)}
              className={`rounded-xl border p-4 bg-white flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                editingItem?.id === faq.id
                  ? "border-[#3B5BDB] ring-2 ring-[#3B5BDB]/15"
                  : "border-[#E5E4E0] hover:border-slate-350"
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#0D0D0D] truncate" title={faq.question}>
                  {faq.question}
                </h4>
                <div className="flex gap-1.5 items-center">
                  <span className="text-[10px] font-mono font-bold text-[#3B5BDB]">Order: {faq.sort_order}</span>
                  {faq.published ? (
                    <span className="bg-[#2EA86B]/10 text-[#2EA86B] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Live
                    </span>
                  ) : (
                    <span className="bg-[#9B9B9B]/10 text-[#9B9B9B] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-1 text-[#6B6B6B] hover:text-[#3B5BDB] rounded hover:bg-[#F8F7F4] transition"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(faq.id, faq.question)}
                  className="p-1 text-[#E05555] hover:text-[#c94545] rounded hover:bg-[#F8F7F4] transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-[#E5E4E0] rounded-xl text-xs text-[#9B9B9B] italic">
              No FAQs registered yet.
            </div>
          )}
        </div>

        {/* Right Column — Inline Form Workspace */}
        <div className="lg:col-span-2">
          {editingItem ? (
            <form onSubmit={handleSaveSubmit} className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-3">
                <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase">
                  {editingItem.id ? "EDIT FAQ" : "CREATE NEW FAQ"}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="rounded-xl border border-[#E5E4E0] bg-white text-xs text-[#6B6B6B] hover:text-[#0D0D0D] px-3.5 py-1.5 hover:bg-[#F8F7F4] transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#3B5BDB] text-white px-4 py-1.5 text-xs font-semibold hover:bg-[#2f4bc4] disabled:opacity-50 transition"
                  >
                    <Save size={12} />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Sorting order Index
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.published || false}
                      onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                      className="rounded border-[#E5E4E0] text-[#3B5BDB] focus:ring-[#3B5BDB]/10 h-4 w-4"
                    />
                    <span>Publish live</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Question text
                  </label>
                  <input
                    type="text"
                    value={editingItem.question || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                    placeholder="e.g. How does the AI caller integration connect to my CRM?"
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                    Answer details
                  </label>
                  <textarea
                    value={editingItem.answer || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                    placeholder="Provide a detailed, helpful answer explaining integration mechanisms..."
                    rows={6}
                    required
                    className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none font-sans"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full rounded-xl border border-dashed border-[#E5E4E0] bg-[#F8F7F4]/20 flex flex-col items-center justify-center p-8 text-center text-xs text-[#9B9B9B] min-h-[300px]">
              <span>Select an FAQ on the left to edit, or click "Add New FAQ".</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
