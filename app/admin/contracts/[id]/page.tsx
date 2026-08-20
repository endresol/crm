import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getContract } from "@/features/contracts/service";
import { listContacts } from "@/features/contacts/service";
import { listDeals } from "@/features/deals/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { formatCurrency, formatDate } from "@/lib/format";
import { CONTRACT_STATUS_BADGE_VARIANT, CONTRACT_STATUS_LABELS } from "@/features/contracts/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditContractButton } from "@/features/contracts/components/EditContractButton";
import { DeleteContractButton } from "@/features/contracts/components/DeleteContractButton";
import { ContractEditor } from "@/features/contracts/components/ContractEditor";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const contract = await getContract(user.workspaceId, id);
  if (!contract) notFound();

  const [contacts, deals, templates] = await Promise.all([
    listContacts(user.workspaceId),
    listDeals(user.workspaceId),
    listTemplatesByType(user.workspaceId, "CONTRACT"),
  ]);

  return (
    <>
      <Topbar
        title={contract.name}
        subtitle="Contract details"
        actions={
          <>
            <EditContractButton
              contract={contract}
              contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
              deals={deals.map((d) => ({ id: d.id, name: d.name, clientId: d.clientId }))}
              templates={templates}
            />
            <DeleteContractButton contractId={contract.id} clientId={contract.clientId} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/contracts"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to contracts
          </Link>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <Badge variant={CONTRACT_STATUS_BADGE_VARIANT[contract.status]}>
              {CONTRACT_STATUS_LABELS[contract.status]}
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
            <Field label="Client" value={contract.client.name} href={`/admin/clients/${contract.client.id}`} />
            <Field label="Contact" value={contract.contact?.fullName} />
            <Field label="Deal" value={contract.deal?.name} />
            <Field label="Template" value={contract.template?.name} />
            <Field label="Contract type" value={contract.contractType} />
            <Field
              label="Contract value"
              value={
                contract.contractValue != null
                  ? formatCurrency(contract.contractValue, contract.currency)
                  : undefined
              }
            />
            <Field label="Start date" value={contract.startDate ? formatDate(contract.startDate, user.workspaceDateFormat) : undefined} />
            <Field label="End date" value={contract.endDate ? formatDate(contract.endDate, user.workspaceDateFormat) : undefined} />
          </dl>

          <ContractEditor
            contract={contract}
            client={contract.client}
            workspaceName={user.workspaceName}
            template={contract.template}
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
