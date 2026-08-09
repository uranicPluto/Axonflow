import { createFileRoute } from "@tanstack/react-router";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";

export const Route = createFileRoute("/admin/portfolio/$id")({
  component: EditCaseStudy,
});

function EditCaseStudy() {
  const { id } = Route.useParams();
  return <CaseStudyEditor projectId={id} />;
}
