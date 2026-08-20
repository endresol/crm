import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getPriceBook, listUnpricedProducts } from "@/features/price-books/service";
import { formatDate, formatCurrency } from "@/lib/format";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { DeletePriceBookButton } from "@/features/price-books/components/DeletePriceBookButton";
import { AddPriceBookEntryButton } from "@/features/price-books/components/AddPriceBookEntryButton";
import { DeletePriceBookEntryButton } from "@/features/price-books/components/DeletePriceBookEntryButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PriceBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const priceBook = await getPriceBook(user.workspaceId, id);
  if (!priceBook) notFound();

  const unpricedProducts = await listUnpricedProducts(user.workspaceId, priceBook.id);

  return (
    <>
      <Topbar
        title={priceBook.name}
        subtitle="Price book"
        actions={
          <>
            <AddPriceBookEntryButton
              priceBookId={priceBook.id}
              products={unpricedProducts}
              defaultCurrency={user.workspaceCurrency}
            />
            <DeletePriceBookButton priceBookId={priceBook.id} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/products"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to products
          </Link>
        </div>

        <Card>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{priceBook.name}</div>
          {priceBook.description && (
            <p style={{ marginTop: "var(--space-2)", color: "var(--color-text)" }}>
              {priceBook.description}
            </p>
          )}
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Product pricing"
              subtitle={`${priceBook.entries.length} ${
                priceBook.entries.length === 1 ? "product priced" : "products priced"
              }`}
            />
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Unit price</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {priceBook.entries.length === 0 ? (
                  <TableEmptyState
                    colSpan={5}
                    title="No pricing yet"
                    description="Add a product to set its price in this price book."
                  />
                ) : (
                  priceBook.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <td style={{ fontWeight: 600 }}>{entry.product.name}</td>
                      <td>{entry.product.code}</td>
                      <td>{formatCurrency(entry.unitPrice, entry.currency)}</td>
                      <td>{formatDate(entry.createdAt, user.workspaceDateFormat)}</td>
                      <td>
                        <DeletePriceBookEntryButton entryId={entry.id} priceBookId={priceBook.id} />
                      </td>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
