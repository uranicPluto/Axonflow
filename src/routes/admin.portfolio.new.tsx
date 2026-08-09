import { createFileRoute } from "@tanstack/react-router";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";

export const Route = createFileRoute("/admin/portfolio/new")({
  component: NewCaseStudy,
});

function NewCaseStudy() {
  return <CaseStudyEditor />;
}
