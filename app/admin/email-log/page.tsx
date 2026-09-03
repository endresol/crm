import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listEmailLog } from "@/features/email-templates/service";
import { Topbar } from "@/components/layout/Topbar";
import { EmailLogTable } from "@/features/email-templates/components/EmailLogTable";
import styles from "@/components/layout/AdminShell.module.css";

export default async function EmailLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entries = await listEmailLog(user.workspaceId);

  return (
    <>
      <Topbar title="Email Log" subtitle="Every email sent from this workspace, and whether it went through." />
      <div className={styles.content}>
        <EmailLogTable
          entries={entries}
          timezone={user.workspaceTimezone}
          dateFormat={user.workspaceDateFormat}
        />
      </div>
    </>
  );
}
