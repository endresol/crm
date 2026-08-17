"use client";

import { useActionState, useEffect, useId } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "../constants";
import type { LeadActionState } from "../actions";

const initialState: LeadActionState = {};

export function LeadForm({
  action,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
  showStatus = false,
}: {
  action: (prevState: LeadActionState, formData: FormData) => Promise<LeadActionState>;
  defaultValues?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    businessName?: string | null;
    website?: string | null;
    budget?: number | null;
    source?: string | null;
    description?: string | null;
    status?: string;
  };
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
  footerExtra?: React.ReactNode;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formId = useId();

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

        <Input name="name" label="Name" defaultValue={defaultValues?.name} required />
        <Input
          name="email"
          type="email"
          label="Email"
          optional
          defaultValue={defaultValues?.email ?? ""}
        />
        <Input name="phone" label="Phone" optional defaultValue={defaultValues?.phone ?? ""} />
        <Input
          name="businessName"
          label="Business name"
          optional
          defaultValue={defaultValues?.businessName ?? ""}
        />
        <Input
          name="website"
          label="Website"
          optional
          placeholder="https://"
          defaultValue={defaultValues?.website ?? ""}
        />

        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Input
            name="budget"
            type="number"
            min="0"
            step="0.01"
            label="Budget"
            optional
            defaultValue={defaultValues?.budget ?? ""}
          />
          <Input
            name="source"
            label="Source"
            optional
            defaultValue={defaultValues?.source ?? ""}
          />
        </div>

        {showStatus && (
          <Select name="status" label="Status" defaultValue={defaultValues?.status ?? "NEW"}>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        )}

        <Textarea
          name="description"
          label="Description"
          optional
          defaultValue={defaultValues?.description ?? ""}
        />
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
