import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { logOutAction } from "@/features/auth/actions";
import { Sidebar } from "@/components/layout/Sidebar";
import styles from "@/components/layout/AdminShell.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className={styles.shell}>
      <Sidebar workspaceName={user.workspaceName} userName={user.name} onLogout={logOutAction} />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
