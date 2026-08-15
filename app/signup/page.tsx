import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
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
