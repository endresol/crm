import { getCurrentUser } from "@/lib/auth/session";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import styles from "@/components/layout/AdminShell.module.css";

export default async function DashboardPage() {
  const user = await getCurrentUser();

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
      </div>
    </>
  );
}
