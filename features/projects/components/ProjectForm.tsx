"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PROJECT_STATUS_LABELS } from "../constants";
import { PROJECT_STATUSES } from "../schemas";
import type { ProjectActionState } from "../actions";

const initialState: ProjectActionState = {};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function ProjectForm({
  action,
  clients,
  fixedClientId,
  defaultValues,
  submitLabel,
  onCancel,
}: {
  action: (prevState: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  clients?: { id: string; name: string }[];
  fixedClientId?: string;
  defaultValues?: {
    name?: string;
    description?: string | null;
    status?: string;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
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
        <Select name="clientId" label="Client" defaultValue="" required>
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

      <Input name="name" label="Project name" defaultValue={defaultValues?.name} required />

      <Textarea
        name="description"
        label="Description"
        optional
        defaultValue={defaultValues?.description ?? ""}
      />

      <Select name="status" label="Status" defaultValue={defaultValues?.status ?? "PLANNING"}>
        {PROJECT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {PROJECT_STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input
          name="startDate"
          type="date"
          label="Start date"
          optional
          defaultValue={toDateInputValue(defaultValues?.startDate)}
        />
        <Input
          name="endDate"
          type="date"
          label="End date"
          optional
          defaultValue={toDateInputValue(defaultValues?.endDate)}
        />
      </div>

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
