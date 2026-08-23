import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getClient } from "@/features/clients/service";
import { listTimeEntriesForClient, listClientsForLogging } from "@/features/time-entries/service";
import { listProjectsForClient } from "@/features/projects/service";
import { listContactsForClient } from "@/features/contacts/service";
import { listDealsForClient } from "@/features/deals/service";
import { listInvoicesForClient } from "@/features/invoices/service";
import { listQuestionnairesForClient } from "@/features/questionnaires/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { PROJECT_STATUS_BADGE_VARIANT, PROJECT_STATUS_LABELS } from "@/features/projects/constants";
import { DEAL_STAGE_BADGE_VARIANT, DEAL_STAGE_LABELS } from "@/features/deals/constants";
import {
  INVOICE_STATUS_BADGE_VARIANT,
  INVOICE_STATUS_LABELS,
  invoiceTotal,
} from "@/features/invoices/constants";
import {
  QUESTIONNAIRE_STATUS_BADGE_VARIANT,
  QUESTIONNAIRE_STATUS_LABELS,
} from "@/features/questionnaires/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { IMAGE_ACCEPT_ATTR } from "@/lib/uploads";
import { EditClientButton } from "@/features/clients/components/EditClientButton";
import { DeleteClientButton } from "@/features/clients/components/DeleteClientButton";
import { ClientLogoUpload } from "@/features/clients/components/ClientLogoUpload";
import { LogTimeButton } from "@/features/time-entries/components/LogTimeButton";
import { TimeEntriesList } from "@/features/time-entries/components/TimeEntriesList";
import { AddProjectButton } from "@/features/projects/components/AddProjectButton";
import { AddContactButton } from "@/features/contacts/components/AddContactButton";
import { AddDealButton } from "@/features/deals/components/AddDealButton";
import { AddInvoiceButton } from "@/features/invoices/components/AddInvoiceButton";
import { AddQuestionnaireButton } from "@/features/questionnaires/components/AddQuestionnaireButton";
import { formatCurrency } from "@/lib/format";
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

  const [
    timeEntries,
    projects,
    contacts,
    deals,
    invoices,
    invoiceTemplates,
    questionnaires,
    questionnaireTemplates,
    clientsForLogging,
  ] = await Promise.all([
    listTimeEntriesForClient(user.workspaceId, client.id),
    listProjectsForClient(user.workspaceId, client.id),
    listContactsForClient(user.workspaceId, client.id),
    listDealsForClient(user.workspaceId, client.id),
    listInvoicesForClient(user.workspaceId, client.id),
    listTemplatesByType(user.workspaceId, "INVOICE"),
    listQuestionnairesForClient(user.workspaceId, client.id),
    listTemplatesByType(user.workspaceId, "QUESTIONNAIRE"),
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
            <ClientLogoUpload
              clientId={client.id}
              clientName={client.name}
              logoUrl={client.logoUrl}
              accept={IMAGE_ACCEPT_ATTR}
            />
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
                      <Avatar name={contact.fullName} imageUrl={contact.avatarUrl} size="sm" />
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
          <Card>
            <CardHeader
              title="Deals"
              subtitle={`${deals.length} ${deals.length === 1 ? "deal" : "deals"}`}
              action={
                <AddDealButton
                  fixedClientId={client.id}
                  contacts={contacts.map((contact) => ({
                    id: contact.id,
                    fullName: contact.fullName,
                    clientId: contact.clientId,
                  }))}
                  label="New deal"
                />
              }
            />
            {deals.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No deals yet for this client.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{deal.name}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        {formatCurrency(deal.amount, deal.currency)}
                      </div>
                    </div>
                    <Badge variant={DEAL_STAGE_BADGE_VARIANT[deal.stage]}>
                      {DEAL_STAGE_LABELS[deal.stage]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Invoices"
              subtitle={`${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"}`}
              action={
                <AddInvoiceButton
                  fixedClientId={client.id}
                  contacts={contacts.map((contact) => ({
                    id: contact.id,
                    fullName: contact.fullName,
                    clientId: contact.clientId,
                  }))}
                  templates={invoiceTemplates}
                  workspaceName={user.workspaceName}
                  defaultCurrency={user.workspaceCurrency}
                  label="New invoice"
                />
              }
            />
            {invoices.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No invoices yet for this client.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/admin/invoices/${invoice.id}`}
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
                    <div>
                      <div style={{ fontWeight: 600 }}>{invoice.name}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        {formatCurrency(invoiceTotal(invoice.lineItems), invoice.currency)}
                      </div>
                    </div>
                    <Badge variant={INVOICE_STATUS_BADGE_VARIANT[invoice.status]}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
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
              title="Questionnaires"
              subtitle={`${questionnaires.length} ${questionnaires.length === 1 ? "questionnaire" : "questionnaires"}`}
              action={
                <AddQuestionnaireButton
                  fixedClientId={client.id}
                  contacts={contacts.map((contact) => ({
                    id: contact.id,
                    fullName: contact.fullName,
                    clientId: contact.clientId,
                  }))}
                  templates={questionnaireTemplates}
                  label="New questionnaire"
                />
              }
            />
            {questionnaires.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No questionnaires yet for this client.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {questionnaires.map((questionnaire) => (
                  <Link
                    key={questionnaire.id}
                    href={`/admin/questionnaires/${questionnaire.id}`}
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
                    <span style={{ fontWeight: 600 }}>{questionnaire.name}</span>
                    <Badge variant={QUESTIONNAIRE_STATUS_BADGE_VARIANT[questionnaire.status]}>
                      {QUESTIONNAIRE_STATUS_LABELS[questionnaire.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <TimeEntriesList entries={timeEntries} dateFormat={user.workspaceDateFormat} />
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
