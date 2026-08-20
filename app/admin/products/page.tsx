import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listProducts } from "@/features/products/service";
import { PRODUCT_TYPE_LABELS, PRODUCT_UNIT_LABELS } from "@/features/products/constants";
import { listDiscounts } from "@/features/discounts/service";
import { DISCOUNT_TYPE_LABELS } from "@/features/discounts/constants";
import { listPriceBooks } from "@/features/price-books/service";
import { formatDate, formatCurrency } from "@/lib/format";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AddProductButton } from "@/features/products/components/AddProductButton";
import { EditProductButton } from "@/features/products/components/EditProductButton";
import { DeleteProductButton } from "@/features/products/components/DeleteProductButton";
import { AddDiscountButton } from "@/features/discounts/components/AddDiscountButton";
import { DeleteDiscountButton } from "@/features/discounts/components/DeleteDiscountButton";
import { AddPriceBookButton } from "@/features/price-books/components/AddPriceBookButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [products, discounts, priceBooks] = await Promise.all([
    listProducts(user.workspaceId),
    listDiscounts(user.workspaceId),
    listPriceBooks(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title="Products"
        subtitle="View and manage your products and services from here."
        actions={
          <>
            <AddPriceBookButton />
            <AddDiscountButton />
            <AddProductButton />
          </>
        }
      />
      <div className={styles.content}>
        <Card>
          <CardHeader
            title="Products"
            subtitle={`${products.length} ${products.length === 1 ? "product" : "products"}`}
          />
          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Family</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <TableEmptyState
                  colSpan={7}
                  title="No products found"
                  description="Get started by adding your first product or service to the system."
                />
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td>{product.code}</td>
                    <td>{product.family || "—"}</td>
                    <td>{PRODUCT_TYPE_LABELS[product.type]}</td>
                    <td>{PRODUCT_UNIT_LABELS[product.unit]}</td>
                    <td>
                      {product.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Archived</Badge>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <EditProductButton product={product} />
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Discounts"
              subtitle={`${discounts.length} ${discounts.length === 1 ? "discount" : "discounts"}`}
            />
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <TableEmptyState colSpan={4} title="No discounts yet" />
                ) : (
                  discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <td style={{ fontWeight: 600 }}>{discount.name}</td>
                      <td>{DISCOUNT_TYPE_LABELS[discount.type]}</td>
                      <td>
                        {discount.type === "PERCENTAGE"
                          ? `${discount.value}%`
                          : formatCurrency(discount.value)}
                      </td>
                      <td>
                        <DeleteDiscountButton discountId={discount.id} />
                      </td>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Price Books"
              subtitle={`${priceBooks.length} ${priceBooks.length === 1 ? "price book" : "price books"}`}
            />
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Products priced</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {priceBooks.length === 0 ? (
                  <TableEmptyState colSpan={4} title="No price books yet" />
                ) : (
                  priceBooks.map((priceBook) => (
                    <TableRow key={priceBook.id}>
                      <td>
                        <Link
                          href={`/admin/products/price-books/${priceBook.id}`}
                          style={{ fontWeight: 600, color: "var(--color-text)" }}
                        >
                          {priceBook.name}
                        </Link>
                      </td>
                      <td>{priceBook.description || "—"}</td>
                      <td>{priceBook._count.entries}</td>
                      <td>{formatDate(priceBook.createdAt, user.workspaceDateFormat)}</td>
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
