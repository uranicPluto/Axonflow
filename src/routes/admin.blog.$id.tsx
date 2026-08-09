import { createFileRoute } from "@tanstack/react-router";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const Route = createFileRoute("/admin/blog/$id")({
  component: EditBlogPost,
});

function EditBlogPost() {
  const { id } = Route.useParams();
  return <BlogEditor postId={id} />;
}
