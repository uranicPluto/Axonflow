import { createFileRoute } from "@tanstack/react-router";
import { AuthComponent } from "@/components/ui/sign-up";
import { brand } from "@/content/site";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="w-full min-h-screen">
      <AuthComponent brandName={brand.name} />
    </div>
  );
}
