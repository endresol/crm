"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ContactActionState } from "../actions";

const initialState: ContactActionState = {};

export function ContactForm({
  action,
  clients,
  fixedClientId,
  defaultValues,
  submitLabel,
  onCancel,
}: {
  action: (prevState: ContactActionState, formData: FormData) => Promise<ContactActionState>;
  clients?: { id: string; name: string }[];
  fixedClientId?: string;
  defaultValues?: {
    fullName?: string;
    jobTitle?: string | null;
    email?: string | null;
    phone?: string | null;
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

      {clients ? (
        <Select name="clientId" label="Client" defaultValue={fixedClientId ?? ""} required>
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      ) : (
        <input type="hidden" name="clientId" value={fixedClientId} />
      )}

      <Input
        name="fullName"
        label="Full name"
        defaultValue={defaultValues?.fullName}
        required
      />
      <Input
        name="jobTitle"
        label="Job title"
        optional
        defaultValue={defaultValues?.jobTitle ?? ""}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        optional
        defaultValue={defaultValues?.email ?? ""}
      />
      <Input name="phone" label="Phone" optional defaultValue={defaultValues?.phone ?? ""} />

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
