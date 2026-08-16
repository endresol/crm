"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ClientActionState } from "../actions";

const initialState: ClientActionState = {};

export function ClientForm({
  action,
  defaultValues,
  submitLabel,
  onCancel,
}: {
  action: (prevState: ClientActionState, formData: FormData) => Promise<ClientActionState>;
  defaultValues?: {
    name?: string;
    legalName?: string | null;
    email?: string | null;
    website?: string | null;
    industry?: string | null;
  };
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

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
      <Input name="name" label="Client name" defaultValue={defaultValues?.name} required />
      <Input
        name="legalName"
        label="Legal name"
        optional
        defaultValue={defaultValues?.legalName ?? ""}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        optional
        defaultValue={defaultValues?.email ?? ""}
      />
      <Input
        name="website"
        label="Website"
        optional
        placeholder="https://"
        defaultValue={defaultValues?.website ?? ""}
      />
      <Input
        name="industry"
        label="Industry"
        optional
        defaultValue={defaultValues?.industry ?? ""}
      />
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
