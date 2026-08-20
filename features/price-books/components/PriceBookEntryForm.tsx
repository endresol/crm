"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { addPriceBookEntryAction, type PriceBookEntryActionState } from "../actions";

const initialState: PriceBookEntryActionState = {};

export function PriceBookEntryForm({
  priceBookId,
  products,
  defaultCurrency = "USD",
  onSaved,
  onCancel,
}: {
  priceBookId: string;
  products: { id: string; name: string; code: string }[];
  defaultCurrency?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const boundAction = addPriceBookEntryAction.bind(null, priceBookId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  if (products.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
          Every product already has a price in this price book.
        </p>
        {onCancel && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Close
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "contents" }}>
      {state.error && (
        <div
          style={{
            background: "var(--color-danger-soft)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            fontSize: "var(--text-sm)",
          }}
        >
          {state.error}
        </div>
      )}

      <Select name="productId" label="Product" defaultValue="" required>
        <option value="">Select a product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.code})
          </option>
        ))}
      </Select>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input name="unitPrice" type="number" min={0} step="0.01" label="Unit price" required />
        <Input name="currency" label="Currency" defaultValue={defaultCurrency} maxLength={8} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add pricing"}
        </Button>
      </div>
    </form>
  );
}
