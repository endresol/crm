import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
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
