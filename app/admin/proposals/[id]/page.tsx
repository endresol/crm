import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getProposal } from "@/features/proposals/service";
import { listContacts } from "@/features/contacts/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { listProducts } from "@/features/products/service";
import { listEmailTemplates } from "@/features/email-templates/service";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  PROPOSAL_STATUS_BADGE_VARIANT,
  PROPOSAL_STATUS_LABELS,
  proposalTotal,
} from "@/features/proposals/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditProposalButton } from "@/features/proposals/components/EditProposalButton";
import { DeleteProposalButton } from "@/features/proposals/components/DeleteProposalButton";
import { LineItemsEditor } from "@/features/proposals/components/LineItemsEditor";
import { SendEmailButton } from "@/features/email-templates/components/SendEmailButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const proposal = await getProposal(user.workspaceId, id);
  if (!proposal) notFound();

  const [contacts, templates, products, emailTemplates] = await Promise.all([
    listContacts(user.workspaceId),
    listTemplatesByType(user.workspaceId, "PROPOSAL"),
    listProducts(user.workspaceId),
    listEmailTemplates(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title={proposal.name}
        subtitle="Proposal details"
        actions={
          <>
            <EditProposalButton
              proposal={proposal}
              contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
              templates={templates}
              workspaceName={user.workspaceName}
            />
            <SendEmailButton
              entityType="PROPOSAL"
              url={`/admin/proposals/${proposal.id}`}
              activityLabel={`Proposal ${proposal.name}`}
              revalidatePaths={["/admin/email-log"]}
              templates={emailTemplates}
              defaultTemplateType="PROPOSAL_SENT"
              defaultTo={proposal.contact?.email ?? proposal.client.email}
              mergeContext={{
                client: { name: proposal.client.name, email: proposal.client.email },
                contact: proposal.contact ? { name: proposal.contact.fullName } : undefined,
                workspace: { name: user.workspaceName },
                today: new Date().toLocaleDateString("en-US"),
                record: {
                  name: proposal.name,
                  amount: formatCurrency(proposalTotal(proposal.lineItems), proposal.currency),
                },
              }}
            />
            <DeleteProposalButton proposalId={proposal.id} clientId={proposal.clientId} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/proposals"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to proposals
          </Link>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <Badge variant={PROPOSAL_STATUS_BADGE_VARIANT[proposal.status]}>
              {PROPOSAL_STATUS_LABELS[proposal.status]}
            </Badge>
          </div>

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-5)",
              marginBottom: "var(--space-6)",
            }}
          >
            <Field label="Client" value={proposal.client.name} href={`/admin/clients/${proposal.client.id}`} />
            <Field label="Contact" value={proposal.contact?.fullName} />
            <Field label="Template" value={proposal.template?.name} />
            <Field label="Currency" value={proposal.currency} />
            <Field label="Created" value={formatDate(proposal.createdAt, user.workspaceDateFormat)} />
            <Field label="Updated" value={formatDate(proposal.updatedAt, user.workspaceDateFormat)} />
          </dl>

          {proposal.notes && (
            <div style={{ marginBottom: "var(--space-6)" }}>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-text-faint)",
                  fontWeight: 600,
                  marginBottom: "var(--space-2)",
                }}
              >
                Notes
              </div>
              <p style={{ whiteSpace: "pre-wrap", fontSize: "var(--text-sm)" }}>{proposal.notes}</p>
            </div>
          )}

          <LineItemsEditor
            proposalId={proposal.id}
            lineItems={proposal.lineItems}
            products={products}
            currency={proposal.currency}
          />
        </Card>
      </div>
    </>
  );
}

function Field({ label, value, href }: { label: string; value?: string | null; href?: string }) {
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
