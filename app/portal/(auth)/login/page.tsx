import { AuthLayout } from "@/components/layout/AuthLayout";
import { PortalLoginForm } from "@/features/portal-auth/components/PortalLoginForm";

export default function PortalLoginPage() {
  return (
    <AuthLayout heading="Client Portal" subheading="Sign in to see your projects and questionnaires.">
      <PortalLoginForm />
    </AuthLayout>
  );
}
