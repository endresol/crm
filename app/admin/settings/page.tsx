import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspace } from "@/features/workspace-settings/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { SettingsForm } from "@/features/workspace-settings/components/SettingsForm";
import styles from "@/components/layout/AdminShell.module.css";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspace(user.workspaceId);

  return (
    <>
      <Topbar title="Settings" subtitle="Workspace name, branding, and regional preferences." />
      <div className={styles.content}>
        <Card>
          <SettingsForm workspace={workspace} />
        </Card>
      </div>
    </>
  );
}
