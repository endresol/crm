import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listActivity } from "@/features/activity/service";
import { Topbar } from "@/components/layout/Topbar";
import { ActivityPanel } from "@/features/activity/components/ActivityPanel";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entries = await listActivity(user.workspaceId);

  return (
    <>
      <Topbar title="Activity" subtitle="Who did what, across the workspace." />
      <div className={styles.content}>
        <ActivityPanel entries={entries} />
      </div>
    </>
  );
}
