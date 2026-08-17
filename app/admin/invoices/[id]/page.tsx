import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getInvoice } from "@/features/invoices/service";
import { listContacts } from "@/features/contacts/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import { listProducts } from "@/features/products/service";
import { formatDate } from "@/lib/format";
import {
  INVOICE_BILLING_TYPE_LABELS,
  INVOICE_STATUS_BADGE_VARIANT,
  INVOICE_STATUS_LABELS,
} from "@/features/invoices/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditInvoiceButton } from "@/features/invoices/components/EditInvoiceButton";
import { DeleteInvoiceButton } from "@/features/invoices/components/DeleteInvoiceButton";
import { LineItemsEditor } from "@/features/invoices/components/LineItemsEditor";
import styles from "@/components/layout/AdminShell.module.css";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const invoice = await getInvoice(user.workspaceId, id);
  if (!invoice) notFound();

  const [contacts, templates, products] = await Promise.all([
    listContacts(user.workspaceId),
    listTemplatesByType(user.workspaceId, "INVOICE"),
    listProducts(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title={invoice.name}
        subtitle="Invoice details"
        actions={
          <>
            <EditInvoiceButton
              invoice={invoice}
              contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
              templates={templates}
              workspaceName={user.workspaceName}
            />
            <DeleteInvoiceButton invoiceId={invoice.id} clientId={invoice.clientId} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/invoices"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to invoices
          </Link>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <Badge variant={INVOICE_STATUS_BADGE_VARIANT[invoice.status]}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Badge>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              {INVOICE_BILLING_TYPE_LABELS[invoice.billingType]}
            </span>
          </div>

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-5)",
              marginBottom: "var(--space-6)",
            }}
          >
            <Field label="Client" value={invoice.client.name} href={`/admin/clients/${invoice.client.id}`} />
            <Field label="Contact" value={invoice.contact?.fullName} />
            <Field label="Template" value={invoice.template?.name} />
            <Field label="Invoice date" value={formatDate(invoice.invoiceDate)} />
            <Field label="Due date" value={invoice.dueDate ? formatDate(invoice.dueDate) : undefined} />
            <Field label="Currency" value={invoice.currency} />
          </dl>

          {invoice.notes && (
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
              <p style={{ whiteSpace: "pre-wrap", fontSize: "var(--text-sm)" }}>{invoice.notes}</p>
            </div>
          )}

          <LineItemsEditor
            invoiceId={invoice.id}
            lineItems={invoice.lineItems}
            products={products}
            currency={invoice.currency}
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
