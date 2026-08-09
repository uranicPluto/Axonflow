import { useState, useEffect } from "react";
import { BlogPost, getPostFn, savePostFn } from "@/lib/db";
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, Save, Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface Block {
  heading?: string;
  paragraphs: string[];
}

export function BlogEditor({ postId }: { postId?: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Operations");
  const [author, setAuthor] = useState("Jay Mahajan");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("draft");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Block builder list
  const [blocks, setBlocks] = useState<Block[]>([{ paragraphs: [""] }]);

  // Load existing post if ID is present
  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        const post = await getPostFn({ data: postId });
        if (post) {
          setTitle(post.title);
          setSlug(post.slug);
          setCategory(post.category);
          setAuthor(post.author);
          setDate(post.date);
          setExcerpt(post.excerpt);
          setStatus(post.status);
          setSeoTitle(post.seo_title || "");
          setSeoDescription(post.seo_description || "");
          setOgImageUrl(post.og_image_url || "");

          try {
            const parsedBlocks = JSON.parse(post.body);
            setBlocks(Array.isArray(parsedBlocks) ? parsedBlocks : [{ paragraphs: [""] }]);
          } catch {
            setBlocks([{ paragraphs: [post.body || ""] }]);
          }
        }
      } catch (err) {
        console.error("Failed to load post details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!postId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  // Auto calculate read time
  const calculateReadTime = () => {
    const textLength = blocks.reduce((acc, b) => acc + (b.heading || "").length + b.paragraphs.join(" ").length, 0);
    const words = textLength / 5;
    const minutes = Math.max(1, Math.ceil(words / 200)); // ~200 wpm
    return `${minutes} min`;
  };

  // Block management helpers
  const handleAddParagraphBlock = () => {
    setBlocks([...blocks, { paragraphs: [""] }]);
  };

  const handleAddHeadingBlock = () => {
    setBlocks([...blocks, { heading: "New Section", paragraphs: [""] }]);
  };

  const handleUpdateBlockHeading = (idx: number, heading: string) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, heading } : b)));
  };

  const handleUpdateBlockParagraphs = (idx: number, paragraphsRaw: string) => {
    // Splits paragraphs by double newline (or single newline) to generate clean paragraphs array
    const paragraphs = paragraphsRaw.split("\n\n").map((p) => p.trim()).filter(Boolean);
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, paragraphs: paragraphs.length ? paragraphs : [""] } : b)));
  };

  const handleRemoveBlock = (idx: number) => {
    if (blocks.length === 1) {
      alert("Your blog needs at least one block of content!");
      return;
    }
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const handleMoveBlock = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === blocks.length - 1) return;

    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    const result = [...blocks];
    const temp = result[idx];
    result[idx] = result[nextIdx];
    result[nextIdx] = temp;
    setBlocks(result);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Title and Slug are required fields!");
      return;
    }

    setSaving(true);
    const postPayload: Partial<BlogPost> = {
      id: postId,
      title,
      slug,
      category,
      author,
      date,
      read_time: calculateReadTime(),
      excerpt,
      body: JSON.stringify(blocks),
      status,
      seo_title: seoTitle || title,
      seo_description: seoDescription || excerpt,
      og_image_url: ogImageUrl,
    };

    try {
      await savePostFn({ data: postPayload });
      navigate({ to: "/admin/blog" });
    } catch (err) {
      console.error(err);
      alert("Failed to save blog post details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading blog editor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E4E0] pb-5 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/admin/blog" })}
            className="p-2 rounded-lg border border-[#E5E4E0] hover:bg-[#F8F7F4] transition text-[#6B6B6B]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-[#0D0D0D]">
              {postId ? `Edit Blog Post` : "New Blog Post"}
            </h1>
            <p className="text-xs text-[#9B9B9B] mt-0.5">Configure publication elements, slug, and text content.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E5E4E0] rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold">
            <span className="text-[#6B6B6B]">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#0D0D0D] cursor-pointer"
            >
              <option value="draft">Draft ⏱</option>
              <option value="published">Published ✓</option>
            </select>
          </div>

          {postId && (
            <a
              href={`/insights/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E4E0] bg-white text-[#0D0D0D] px-3.5 py-2 text-xs font-semibold hover:bg-[#F8F7F4] transition shadow-sm"
            >
              <Eye size={14} />
              <span>Preview</span>
            </a>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] disabled:opacity-50 transition shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Post"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Post details */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            POST DETAILS
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Automation ROI is a measurement problem"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/10 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. automation-roi-is-a-measurement-problem"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/10 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              >
                <option value="Operations">Operations</option>
                <option value="AI Engineering">AI Engineering</option>
                <option value="Revenue">Revenue</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Jay Mahajan"
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Publication Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Cover Image URL
              </label>
              <input
                type="text"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/... or leave blank"
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Post Excerpt (Meta Description)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a brief 1-2 sentence excerpt summarizing the article..."
                rows={3}
                required
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        </div>

        {/* Dynamic block builder */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E0] pb-2">
            <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase">
              BODY CONTENT BUILDER
            </h3>
            <span className="text-[10px] text-[#9B9B9B] font-mono">
              Calculated Read Time: {calculateReadTime()}
            </span>
          </div>

          <div className="space-y-6">
            {blocks.map((block, idx) => {
              const isHeadingBlock = block.heading !== undefined;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E5E4E0] bg-[#F8F7F4]/30 p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E4E0]/80 pb-2">
                    <span className="text-[9px] font-bold tracking-wider text-[#9B9B9B] font-mono uppercase">
                      {isHeadingBlock ? `Block #${idx + 1} — Heading Section` : `Block #${idx + 1} — Paragraph Block`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-white border border-[#E5E4E0] disabled:opacity-30 transition text-[#6B6B6B]"
                        title="Move Up"
                      >
                        <ArrowUp size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(idx, "down")}
                        disabled={idx === blocks.length - 1}
                        className="p-1 rounded hover:bg-white border border-[#E5E4E0] disabled:opacity-30 transition text-[#6B6B6B]"
                        title="Move Down"
                      >
                        <ArrowDown size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(idx)}
                        className="p-1 rounded hover:bg-white border border-[#E5E4E0] text-[#E05555] transition"
                        title="Delete Block"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  {isHeadingBlock && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                        Heading Title
                      </label>
                      <input
                        type="text"
                        value={block.heading}
                        onChange={(e) => handleUpdateBlockHeading(idx, e.target.value)}
                        placeholder="e.g. The exception tax"
                        required
                        className="w-full rounded-xl border border-[#E5E4E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] font-bold focus:border-[#3B5BDB]/50 focus:outline-none transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1">
                      {isHeadingBlock ? "Paragraphs text (Use double enter for separate paragraphs)" : "Paragraph text (Use double enter for separate paragraphs)"}
                    </label>
                    <textarea
                      defaultValue={block.paragraphs.join("\n\n")}
                      onBlur={(e) => handleUpdateBlockParagraphs(idx, e.target.value)}
                      placeholder="Type section paragraphs here. Use a double Return to split into separate paragraphs..."
                      rows={5}
                      className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddParagraphBlock}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E5E4E0] bg-white py-3 text-xs font-semibold text-[#6B6B6B] hover:bg-[#F8F7F4] hover:text-[#0D0D0D] transition"
            >
              <Plus size={14} className="text-[#3B5BDB]" />
              <span>Add Paragraph Block</span>
            </button>
            <button
              type="button"
              onClick={handleAddHeadingBlock}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E5E4E0] bg-white py-3 text-xs font-semibold text-[#6B6B6B] hover:bg-[#F8F7F4] hover:text-[#0D0D0D] transition"
            >
              <Plus size={14} className="text-[#3B5BDB]" />
              <span>Add Heading Section</span>
            </button>
          </div>
        </div>

        {/* SEO Overrides */}
        <div className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6B6B6B] font-mono tracking-wider uppercase border-b border-[#E5E4E0] pb-2">
            SEO OVERRIDES (OPTIONAL)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                SEO Title ({seoTitle.length}/60 chars)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))}
                placeholder={title || "Defaults to article title"}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase font-mono mb-1.5">
                Meta Description ({seoDescription.length}/155 chars)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value.slice(0, 155))}
                placeholder={excerpt || "Defaults to excerpt"}
                rows={2}
                className="w-full rounded-xl border border-[#E5E4E0] bg-white p-3 text-xs text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/50 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
