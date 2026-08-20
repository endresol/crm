import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listInvoices } from "@/features/invoices/service";
import { listClients } from "@/features/clients/service";
import { listContacts } from "@/features/contacts/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { formatCurrency, formatDate } from "@/lib/format";
import { INVOICE_STATUS_BADGE_VARIANT, INVOICE_STATUS_LABELS, invoiceTotal } from "@/features/invoices/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AddInvoiceButton } from "@/features/invoices/components/AddInvoiceButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [invoices, clients, contacts, templates] = await Promise.all([
    listInvoices(user.workspaceId),
    listClients(user.workspaceId),
    listContacts(user.workspaceId),
    listTemplatesByType(user.workspaceId, "INVOICE"),
  ]);

  return (
    <>
      <Topbar
        title="Invoices"
        subtitle="View all your client invoices here."
        actions={
          <AddInvoiceButton
            clients={clients}
            contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
            templates={templates}
            workspaceName={user.workspaceName}
            defaultCurrency={user.workspaceCurrency}
          />
        }
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Invoice date</th>
              <th>Due date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                title="No invoices found"
                description="Get started by creating your first invoice for your clients."
              />
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <td>
                    <Link
                      href={`/admin/invoices/${invoice.id}`}
                      style={{ fontWeight: 600, color: "var(--color-text)" }}
                    >
                      {invoice.name}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/clients/${invoice.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {invoice.client.name}
                    </Link>
                  </td>
                  <td>
                    <Badge variant={INVOICE_STATUS_BADGE_VARIANT[invoice.status]}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                  </td>
                  <td>{formatCurrency(invoiceTotal(invoice.lineItems), invoice.currency)}</td>
                  <td>{formatDate(invoice.invoiceDate, user.workspaceDateFormat)}</td>
                  <td>{invoice.dueDate ? formatDate(invoice.dueDate, user.workspaceDateFormat) : "—"}</td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
