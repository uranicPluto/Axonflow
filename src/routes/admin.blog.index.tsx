import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPostsFn, deletePostFn, savePostFn, BlogPost } from "@/lib/db";
import { Plus, Edit3, Trash2, Globe, Eye, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/blog/")({
  component: BlogList,
});

function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPosts = async () => {
    try {
      const data = await getPostsFn();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load blog posts list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the blog post "${title}"?`)) {
      try {
        await deletePostFn({ data: id });
        loadPosts();
      } catch (err) {
        console.error(err);
        alert("Failed to delete blog post");
      }
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      await savePostFn({
        data: {
          id: post.id,
          status: nextStatus,
        },
      });
      loadPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-mono text-[#9B9B9B] animate-pulse">Loading blog directory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4E0] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0D0D0D] tracking-tight">Blog Articles</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Write, review, and manage article posts in the House of Workflow CMS.
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/blog/new" })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B5BDB] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#2f4bc4] transition shadow-sm"
        >
          <Plus size={14} />
          <span>New Blog Post</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9B9B9B]">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by title or excerpt..."
            className="w-full rounded-xl border border-[#E5E4E0] bg-white py-2 pl-9 pr-4 text-xs text-[#0D0D0D] placeholder:text-[#9B9B9B] focus:border-[#3B5BDB]/55 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/10 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
            <Filter size={12} /> Status:
          </span>
          <div className="flex bg-white p-1 border border-[#E5E4E0] rounded-xl shadow-inner">
            {["all", "published", "draft"].map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-lg transition ${
                  statusFilter === opt
                    ? "bg-[#3B5BDB]/10 text-[#3B5BDB]"
                    : "text-[#6B6B6B] hover:text-[#0D0D0D]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E4E0] bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E4E0] bg-[#F8F7F4]/50 text-[10px] font-bold text-[#6B6B6B] uppercase font-mono tracking-wider">
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4">Read Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4E0] text-xs">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#F8F7F4]/30 transition">
                  <td className="p-4 font-semibold text-[#0D0D0D]">
                    <div className="max-w-[300px] truncate" title={post.title}>
                      {post.title}
                    </div>
                    <div className="text-[10px] text-[#9B9B9B] max-w-[300px] truncate mt-0.5">
                      {post.excerpt}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-[#3B5BDB]/5 text-[#3B5BDB] px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4 text-[#6B6B6B]">{formatDate(post.date)}</td>
                  <td className="p-4 text-[#6B6B6B] font-mono">{post.read_time}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(post)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase hover:opacity-85 transition ${
                        post.status === "published"
                          ? "bg-[#2EA86B]/10 text-[#2EA86B]"
                          : "bg-[#F0A500]/10 text-[#F0A500]"
                      }`}
                    >
                      {post.status === "published" ? "Published ✓" : "Draft ⏱"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/insights/${post.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#6B6B6B] hover:text-[#0D0D0D] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="View live site"
                      >
                        <Eye size={12} />
                      </a>
                      <button
                        onClick={() => navigate({ to: `/admin/blog/${post.id}` })}
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#3B5BDB] hover:text-[#2f4bc4] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="Edit post"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 rounded-lg border border-[#E5E4E0] bg-white text-[#E05555] hover:text-[#c94545] hover:bg-[#F8F7F4] transition shadow-sm"
                        title="Delete post"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#6B6B6B] italic">
                  No blog articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
