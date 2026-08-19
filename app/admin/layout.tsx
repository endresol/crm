import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { logOutAction } from "@/features/auth/actions";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkspaceTheme } from "@/components/layout/WorkspaceTheme";
import styles from "@/components/layout/AdminShell.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
        />
        <div className={styles.main}>{children}</div>
      </div>
    </>
  );
}
