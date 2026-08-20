import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listContracts } from "@/features/contracts/service";
import { listClients } from "@/features/clients/service";
import { listContacts } from "@/features/contacts/service";
import { listDeals } from "@/features/deals/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { formatCurrency, formatDate } from "@/lib/format";
import { CONTRACT_STATUS_BADGE_VARIANT, CONTRACT_STATUS_LABELS } from "@/features/contracts/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AddContractButton } from "@/features/contracts/components/AddContractButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ContractsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [contracts, clients, contacts, deals, templates] = await Promise.all([
    listContracts(user.workspaceId),
    listClients(user.workspaceId),
    listContacts(user.workspaceId),
    listDeals(user.workspaceId),
    listTemplatesByType(user.workspaceId, "CONTRACT"),
  ]);

  return (
    <>
      <Topbar
        title="Contracts"
        subtitle="View and manage your contracts from here."
        actions={
          <AddContractButton
            clients={clients}
            contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
            deals={deals.map((d) => ({ id: d.id, name: d.name, clientId: d.clientId }))}
            templates={templates}
            defaultCurrency={user.workspaceCurrency}
          />
        }
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Contract</th>
              <th>Client</th>
              <th>Status</th>
              <th>Type</th>
              <th>Start date</th>
              <th>End date</th>
              <th>Value</th>
              <th>Deal</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <TableEmptyState
                colSpan={8}
                title="No data found"
                description="There are no items to display at the moment."
              />
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <td>
                    <Link
                      href={`/admin/contracts/${contract.id}`}
                      style={{ fontWeight: 600, color: "var(--color-text)" }}
                    >
                      {contract.name}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/clients/${contract.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {contract.client.name}
                    </Link>
                  </td>
                  <td>
                    <Badge variant={CONTRACT_STATUS_BADGE_VARIANT[contract.status]}>
                      {CONTRACT_STATUS_LABELS[contract.status]}
                    </Badge>
                  </td>
                  <td>{contract.contractType ?? "—"}</td>
                  <td>{contract.startDate ? formatDate(contract.startDate, user.workspaceDateFormat) : "—"}</td>
                  <td>{contract.endDate ? formatDate(contract.endDate, user.workspaceDateFormat) : "—"}</td>
                  <td>
                    {contract.contractValue != null
                      ? formatCurrency(contract.contractValue, contract.currency)
                      : "—"}
                  </td>
                  <td>{contract.deal?.name ?? "—"}</td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
