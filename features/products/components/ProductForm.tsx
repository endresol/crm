"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { PRODUCT_TYPE_LABELS, PRODUCT_UNIT_LABELS } from "../constants";
import { PRODUCT_TYPES, PRODUCT_UNITS } from "../schemas";
import type { ProductActionState } from "../actions";

const initialState: ProductActionState = {};

export function ProductForm({
  action,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
}: {
  action: (prevState: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  defaultValues?: {
    name?: string;
    code?: string;
    family?: string | null;
    type?: string;
    unit?: string;
    description?: string | null;
    active?: boolean;
  };
  submitLabel: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

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

      <Input name="name" label="Product name" defaultValue={defaultValues?.name} required />

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input name="code" label="Product code" defaultValue={defaultValues?.code} required />
        <Input
          name="family"
          label="Product family"
          optional
          defaultValue={defaultValues?.family ?? ""}
        />
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Select name="type" label="Product type" defaultValue={defaultValues?.type ?? "PRODUCT"}>
          {PRODUCT_TYPES.map((type) => (
            <option key={type} value={type}>
              {PRODUCT_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Select name="unit" label="Unit of measure" defaultValue={defaultValues?.unit ?? "EACH"}>
          {PRODUCT_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {PRODUCT_UNIT_LABELS[unit]}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        name="description"
        label="Description"
        optional
        defaultValue={defaultValues?.description ?? ""}
      />

      <Checkbox name="active" defaultChecked={defaultValues?.active ?? true} label="Active" />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
