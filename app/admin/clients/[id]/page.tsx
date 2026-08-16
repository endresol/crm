import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getClient } from "@/features/clients/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EditClientButton } from "@/features/clients/components/EditClientButton";
import { DeleteClientButton } from "@/features/clients/components/DeleteClientButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const client = await getClient(user.workspaceId, id);
  if (!client) notFound();

  return (
    <>
      <Topbar
        title={client.name}
        subtitle="Client details"
        actions={
          <>
            <EditClientButton client={client} />
            <DeleteClientButton clientId={client.id} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/clients"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to clients
          </Link>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              marginBottom: "var(--space-6)",
            }}
          >
            <Avatar name={client.name} size="lg" />
            <div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{client.name}</div>
              {client.legalName && (
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  {client.legalName}
                </div>
              )}
            </div>
          </div>

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-5)",
            }}
          >
            <Field label="Email" value={client.email} />
            <Field label="Website" value={client.website} />
            <Field label="Industry" value={client.industry} />
          </dl>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt
        style={{
          fontSize: "var(--text-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-text-faint)",
          fontWeight: 600,
          marginBottom: "var(--space-1)",
        }}
      >
        {label}
      </dt>
      <dd style={{ fontSize: "var(--text-md)" }}>{value || "—"}</dd>
    </div>
  );
}
