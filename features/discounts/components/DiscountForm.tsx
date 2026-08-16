"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DISCOUNT_TYPE_LABELS } from "../constants";
import { DISCOUNT_TYPES } from "../schemas";
import { createDiscountAction, type DiscountActionState } from "../actions";

const initialState: DiscountActionState = {};

export function DiscountForm({ onSaved, onCancel }: { onSaved: () => void; onCancel?: () => void }) {
  const [state, formAction, pending] = useActionState(createDiscountAction, initialState);
  const [type, setType] = useState<(typeof DISCOUNT_TYPES)[number]>("PERCENTAGE");

  useEffect(() => {
    if (state.success) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

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

      <Input name="name" label="Discount name" placeholder="Eg. Early bird" required />

      <Select
        name="type"
        label="Discount type"
        defaultValue="PERCENTAGE"
        onChange={(event) => setType(event.target.value as (typeof DISCOUNT_TYPES)[number])}
      >
        {DISCOUNT_TYPES.map((discountType) => (
          <option key={discountType} value={discountType}>
            {DISCOUNT_TYPE_LABELS[discountType]}
          </option>
        ))}
      </Select>

      <Input
        name="value"
        type="number"
        min={0}
        step="0.01"
        label="Discount value"
        placeholder={type === "PERCENTAGE" ? "Eg. 10 for 10%" : "Eg. 50 for $50"}
        required
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create discount"}
        </Button>
      </div>
    </form>
  );
}
