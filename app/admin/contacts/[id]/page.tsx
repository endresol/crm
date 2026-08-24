import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getContact, hasPortalAccess } from "@/features/contacts/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { IMAGE_ACCEPT_ATTR } from "@/lib/uploads";
import { EditContactButton } from "@/features/contacts/components/EditContactButton";
import { DeleteContactButton } from "@/features/contacts/components/DeleteContactButton";
import { ContactAvatarUpload } from "@/features/contacts/components/ContactAvatarUpload";
import { PortalAccessCard } from "@/features/contacts/components/PortalAccessCard";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const contact = await getContact(user.workspaceId, id);
  if (!contact) notFound();

  const portalEnabled = await hasPortalAccess(user.workspaceId, contact.id);

  return (
    <>
      <Topbar
        title={contact.fullName}
        subtitle="Contact details"
        actions={
          <>
            <EditContactButton contact={contact} />
            <DeleteContactButton contactId={contact.id} clientId={contact.clientId} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/contacts"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to contacts
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
            <ContactAvatarUpload
              contactId={contact.id}
              contactName={contact.fullName}
              avatarUrl={contact.avatarUrl}
              accept={IMAGE_ACCEPT_ATTR}
            />
            <div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
                {contact.fullName}
              </div>
              {contact.jobTitle && (
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  {contact.jobTitle}
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
            <Field label="Email" value={contact.email} />
            <Field label="Phone" value={contact.phone} />
            <Field
              label="Client"
              value={contact.client.name}
              href={`/admin/clients/${contact.client.id}`}
            />
          </dl>
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Client Portal"
              subtitle="Lets this contact sign in to see their projects and questionnaires."
            />
            <PortalAccessCard
              contactId={contact.id}
              hasPortalAccess={portalEnabled}
              hasEmail={Boolean(contact.email)}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | null;
  href?: string;
}) {
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
      <dd style={{ fontSize: "var(--text-md)" }}>
        {value ? (
          href ? (
            <Link href={href} style={{ color: "var(--color-text)" }}>
              {value}
            </Link>
          ) : (
            value
          )
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
}
