import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default async function SignupPage() {
  // See the comment on app/login/page.tsx's equivalent check.
  const user = await getCurrentUser();
  if (user) redirect("/admin/dashboard");

  return (
    <AuthLayout
      heading="Create your workspace"
      subheading="Set up your CRM in under a minute."
      footer={
        <>
          Already have a workspace? <Link href="/login">Sign in</Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
