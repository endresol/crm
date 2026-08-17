"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { PlusIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/format";
import { addLineItemAction, deleteLineItemAction, updateLineItemAction } from "../actions";
import { proposalTotal, lineItemTotal } from "../constants";
import { LineItemForm } from "./LineItemForm";
import type { ProposalLineItem } from "@/generated/prisma/client";

type LineItem = ProposalLineItem & { product: { id: string; name: string } | null };

export function LineItemsEditor({
  proposalId,
  lineItems,
  products,
  currency,
}: {
  proposalId: string;
  lineItems: LineItem[];
  products: { id: string; name: string }[];
  currency: string;
}) {
  const [editing, setEditing] = useState<LineItem | "new" | null>(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-3)" }}>
        <Button size="sm" onClick={() => setEditing("new")}>
          <PlusIcon width={14} height={14} />
          Add line item
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length === 0 ? (
            <TableEmptyState
              colSpan={4}
              title="No line items yet"
              description="Add a line item to start building this proposal."
            />
          ) : (
            lineItems.map((item) => (
              <TableRow key={item.id} onClick={() => setEditing(item)}>
                <td style={{ fontWeight: 600 }}>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice, currency)}</td>
                <td>{formatCurrency(lineItemTotal(item), currency)}</td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      {lineItems.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span>{formatCurrency(proposalTotal(lineItems), currency)}</span>
        </div>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add line item" : "Edit line item"}
      >
        {editing === "new" ? (
          <LineItemForm
            action={addLineItemAction.bind(null, proposalId)}
            products={products}
            submitLabel="Add line item"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <LineItemForm
            action={updateLineItemAction.bind(null, editing.id, proposalId)}
            products={products}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteLineItemAction(editing.id, proposalId);
                  setEditing(null);
                }}
              >
                <Button type="submit" variant="danger" size="sm">
                  Delete
                </Button>
              </form>
            }
          />
        ) : null}
      </Drawer>
    </div>
  );
}
