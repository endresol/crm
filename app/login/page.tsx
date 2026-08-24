import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage() {
  // Authoritative check, not proxy.ts's cheap cookie-presence one — see the
  // comment at the top of proxy.ts for why bouncing an already-logged-in
  // visitor away from here has to happen with a real session lookup.
  const user = await getCurrentUser();
  if (user) redirect("/admin/dashboard");

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your workspace."
      footer={
        <>
          Don&apos;t have a workspace? <Link href="/signup">Create one</Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
