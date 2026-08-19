import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfile } from "@/features/profile/service";
import { IMAGE_ACCEPT_ATTR } from "@/lib/uploads";
import { ROLE_LABELS } from "@/features/team-members/constants";
import { formatDate } from "@/lib/format";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { PasswordForm } from "@/features/profile/components/PasswordForm";
import { AvatarUpload } from "@/features/profile/components/AvatarUpload";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) notFound();

  return (
    <>
      <Topbar title="Your profile" subtitle="Your photo, account details, and password." />
      <div className={styles.content} style={{ display: "grid", gap: "var(--space-6)", maxWidth: 720 }}>
        <Card>
          <CardHeader
            title="Profile photo"
            subtitle="Shown in the sidebar and anywhere your account appears."
            action={<Badge variant="neutral">{ROLE_LABELS[profile.role] ?? profile.role}</Badge>}
          />
          <AvatarUpload
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            accept={IMAGE_ACCEPT_ATTR}
          />
        </Card>

        <Card>
          <CardHeader
            title="Account details"
            subtitle={`Member since ${formatDate(profile.createdAt)}.`}
          />
          <ProfileForm name={profile.name} email={profile.email} />
        </Card>

        <Card>
          <CardHeader title="Password" subtitle="Change the password you use to sign in." />
          <PasswordForm />
        </Card>
      </div>
    </>
  );
}
