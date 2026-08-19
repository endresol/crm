import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspace } from "@/features/workspace-settings/service";
import { IMAGE_ACCEPT_ATTR } from "@/lib/uploads";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { SettingsForm } from "@/features/workspace-settings/components/SettingsForm";
import { LogoUpload } from "@/features/workspace-settings/components/LogoUpload";
import styles from "@/components/layout/AdminShell.module.css";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspace(user.workspaceId);

  return (
    <>
      <Topbar title="Settings" subtitle="Workspace name, branding, and regional preferences." />
      <div className={styles.content} style={{ display: "grid", gap: "var(--space-6)", maxWidth: 720 }}>
        <Card>
          <CardHeader
            title="Workspace logo"
            subtitle="Replaces the default mark in the sidebar."
          />
          <LogoUpload
            workspaceName={workspace.name}
            logoUrl={workspace.logoUrl}
            accept={IMAGE_ACCEPT_ATTR}
          />
        </Card>

        <Card>
          <CardHeader title="Workspace" subtitle="Name, branding colors, and regional preferences." />
          <SettingsForm workspace={workspace} />
        </Card>
      </div>
    </>
  );
}
