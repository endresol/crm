import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PortalLoginForm } from "@/features/portal-auth/components/PortalLoginForm";

export default async function PortalLoginPage() {
  // See the comment on app/login/page.tsx's equivalent check.
  const contact = await getCurrentContact();
  if (contact) redirect("/portal/dashboard");

  return (
    <AuthLayout heading="Client Portal" subheading="Sign in to see your projects and questionnaires.">
      <PortalLoginForm />
    </AuthLayout>
  );
}
