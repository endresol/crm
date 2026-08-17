import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listProposals } from "@/features/proposals/service";
import { listClients } from "@/features/clients/service";
import { listContacts } from "@/features/contacts/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  PROPOSAL_STATUS_BADGE_VARIANT,
  PROPOSAL_STATUS_LABELS,
  proposalTotal,
} from "@/features/proposals/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AddProposalButton } from "@/features/proposals/components/AddProposalButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ProposalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [proposals, clients, contacts, templates] = await Promise.all([
    listProposals(user.workspaceId),
    listClients(user.workspaceId),
    listContacts(user.workspaceId),
    listTemplatesByType(user.workspaceId, "PROPOSAL"),
  ]);

  return (
    <>
      <Topbar
        title="Proposals"
        subtitle="View and manage your proposals from here."
        actions={
          <AddProposalButton
            clients={clients}
            contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
            templates={templates}
            workspaceName={user.workspaceName}
          />
        }
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Proposal</th>
              <th>Client</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                title="No proposals found"
                description="Get started by creating your first proposal for clients."
              />
            ) : (
              proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <td>
                    <Link
                      href={`/admin/proposals/${proposal.id}`}
                      style={{ fontWeight: 600, color: "var(--color-text)" }}
                    >
                      {proposal.name}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/clients/${proposal.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {proposal.client.name}
                    </Link>
                  </td>
                  <td>
                    <Badge variant={PROPOSAL_STATUS_BADGE_VARIANT[proposal.status]}>
                      {PROPOSAL_STATUS_LABELS[proposal.status]}
                    </Badge>
                  </td>
                  <td>{formatCurrency(proposalTotal(proposal.lineItems), proposal.currency)}</td>
                  <td>{formatDate(proposal.createdAt)}</td>
                  <td>{formatDate(proposal.updatedAt)}</td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
