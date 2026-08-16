import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getClient } from "@/features/clients/service";
import { listTimeEntriesForClient, listClientsForLogging } from "@/features/time-entries/service";
import { listProjectsForClient } from "@/features/projects/service";
import { listContactsForClient } from "@/features/contacts/service";
import { PROJECT_STATUS_BADGE_VARIANT, PROJECT_STATUS_LABELS } from "@/features/projects/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EditClientButton } from "@/features/clients/components/EditClientButton";
import { DeleteClientButton } from "@/features/clients/components/DeleteClientButton";
import { LogTimeButton } from "@/features/time-entries/components/LogTimeButton";
import { TimeEntriesList } from "@/features/time-entries/components/TimeEntriesList";
import { AddProjectButton } from "@/features/projects/components/AddProjectButton";
import { AddContactButton } from "@/features/contacts/components/AddContactButton";
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

  const [timeEntries, projects, contacts, clientsForLogging] = await Promise.all([
    listTimeEntriesForClient(user.workspaceId, client.id),
    listProjectsForClient(user.workspaceId, client.id),
    listContactsForClient(user.workspaceId, client.id),
    listClientsForLogging(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title={client.name}
        subtitle="Client details"
        actions={
          <>
            <LogTimeButton clients={clientsForLogging} fixedClientId={client.id} />
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

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Projects"
              subtitle={`${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
              action={<AddProjectButton fixedClientId={client.id} label="New project" />}
            />
            {projects.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No projects yet for this client.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{project.name}</span>
                    <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Contacts"
              subtitle={`${contacts.length} ${contacts.length === 1 ? "contact" : "contacts"}`}
              action={<AddContactButton fixedClientId={client.id} label="New contact" />}
            />
            {contacts.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No contacts yet for this client.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/admin/contacts/${contact.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <Avatar name={contact.fullName} size="sm" />
                      <span style={{ fontWeight: 600 }}>{contact.fullName}</span>
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                      {contact.jobTitle || contact.email || "—"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <TimeEntriesList entries={timeEntries} />
        </div>
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
