import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { logOutAction } from "@/features/auth/actions";
import { getActiveTimer } from "@/features/time-entries/service";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkspaceTheme } from "@/components/layout/WorkspaceTheme";
import styles from "@/components/layout/AdminShell.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const activeTimer = await getActiveTimer(user.id);

  return (
    <>
      <WorkspaceTheme
        colors={{
          backgroundColor: user.workspaceBackgroundColor,
          accentColor: user.workspaceAccentColor,
        }}
      />
      <div className={styles.shell}>
        <Sidebar
          workspaceName={user.workspaceName}
          workspaceLogoUrl={user.workspaceLogoUrl}
          userName={user.name}
          userEmail={user.email}
          userAvatarUrl={user.avatarUrl}
          onLogout={logOutAction}
          activeTimer={activeTimer}
        />
        <div className={styles.main}>{children}</div>
      </div>
    </>
  );
}
