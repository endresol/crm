import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listTimeEntriesByClient, formatMinutes } from "@/features/time-entries/service";
import { listClients } from "@/features/clients/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { LogTimeButton } from "@/features/time-entries/components/LogTimeButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function TimeTrackingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [grouped, clients] = await Promise.all([
    listTimeEntriesByClient(user.workspaceId),
    listClients(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title="Time Tracking"
        subtitle="Manage time for your clients."
        actions={<LogTimeButton clients={clients} />}
      />
      <div className={styles.content}>
        {clients.length === 0 ? (
          <Card>
            <p style={{ color: "var(--color-text-muted)" }}>
              You don&apos;t have any clients yet.{" "}
              <Link href="/admin/clients" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                Add a client
              </Link>{" "}
              before logging time.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {grouped.map(({ client, totalMinutes }) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <Card
                  padded
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                    <Avatar name={client.name} />
                    <span style={{ fontWeight: 600 }}>{client.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                    {formatMinutes(totalMinutes)}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
