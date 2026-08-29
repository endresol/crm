import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listActivity } from "@/features/activity/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import styles from "@/components/layout/AdminShell.module.css";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const recentActivity = user ? await listActivity(user.workspaceId, { take: 8 }) : [];

  return (
    <>
      <Topbar title="Dashboard" subtitle="A bird's-eye view of what's cooking." />
      <div className={styles.content}>
        <Card>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>
            Welcome back, {user?.name ?? "there"} 👋
          </h2>
          <p style={{ color: "var(--color-text-muted)" }}>
            Your workspace <strong>{user?.workspaceName}</strong> is set up. Head to{" "}
            <strong>Clients</strong> to register your first client, then log time against them.
          </p>
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Recent activity"
              subtitle="What's happened across the workspace lately."
              action={
                <Link href="/admin/activity" style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                  View all →
                </Link>
              }
            />
            <ActivityFeed entries={recentActivity} />
          </Card>
        </div>
      </div>
    </>
  );
}
