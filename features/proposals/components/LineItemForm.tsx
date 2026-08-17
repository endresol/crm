"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ProposalLineItemActionState } from "../actions";

const initialState: ProposalLineItemActionState = {};

export function LineItemForm({
  action,
  products,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (
    prevState: ProposalLineItemActionState,
    formData: FormData,
  ) => Promise<ProposalLineItemActionState>;
  products: { id: string; name: string }[];
  defaultValues?: {
    productId?: string | null;
    description?: string;
    quantity?: number;
    unitPrice?: number;
  };
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
  footerExtra?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formId = useId();
  const [description, setDescription] = useState(defaultValues?.description ?? "");

  useEffect(() => {
    if (state.success && onSaved) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <>
      <form id={formId} action={formAction} style={{ display: "contents" }}>
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

        {products.length > 0 && (
          <Select
            name="productId"
            label="Product"
            optional
            defaultValue={defaultValues?.productId ?? ""}
            onChange={(e) => {
              const product = products.find((p) => p.id === e.target.value);
              if (product && !description) setDescription(product.name);
            }}
          >
            <option value="">No product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        )}

        <Input
          name="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Input
            name="quantity"
            type="number"
            min="0"
            step="0.01"
            label="Quantity"
            defaultValue={defaultValues?.quantity ?? 1}
          />
          <Input
            name="unitPrice"
            type="number"
            min="0"
            step="0.01"
            label="Unit price"
            defaultValue={defaultValues?.unitPrice ?? 0}
          />
        </div>
      </form>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <div>{footerExtra}</div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
