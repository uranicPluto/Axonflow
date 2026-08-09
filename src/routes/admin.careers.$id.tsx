import { createFileRoute } from "@tanstack/react-router";
import { CareerEditor } from "@/components/admin/CareerEditor";

export const Route = createFileRoute("/admin/careers/$id")({
  component: EditCareerRole,
});

function EditCareerRole() {
  const { id } = Route.useParams();
  return <CareerEditor roleId={id} />;
}
