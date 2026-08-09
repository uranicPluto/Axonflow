import { createFileRoute } from "@tanstack/react-router";
import { CareerEditor } from "@/components/admin/CareerEditor";

export const Route = createFileRoute("/admin/careers/new")({
  component: NewCareerRole,
});

function NewCareerRole() {
  return <CareerEditor />;
}
