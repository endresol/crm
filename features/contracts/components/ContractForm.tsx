"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CONTRACT_STATUSES, CONTRACT_STATUS_LABELS } from "../constants";
import type { ContractActionState } from "../actions";

const initialState: ContractActionState = {};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function ContractForm({
  action,
  clients,
  contacts,
  deals,
  templates,
  fixedClientId,
  defaultValues,
  submitLabel,
  onCancel,
}: {
  action: (prevState: ContractActionState, formData: FormData) => Promise<ContractActionState>;
  clients?: { id: string; name: string }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  deals: { id: string; name: string; clientId: string }[];
  templates: { id: string; name: string }[];
  fixedClientId?: string;
  defaultValues?: {
    name?: string;
    contactId?: string | null;
    dealId?: string | null;
    templateId?: string | null;
    status?: string;
    contractType?: string | null;
    contractValue?: number | null;
    currency?: string;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
  };
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const clientContacts = contacts.filter((contact) => contact.clientId === clientId);
  const clientDeals = deals.filter((deal) => deal.clientId === clientId);

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

      {templates.length > 0 && (
        <Select name="templateId" label="Template" optional defaultValue={defaultValues?.templateId ?? ""}>
          <option value="">No template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </Select>
      )}

      {clients ? (
        <Select
          name="clientId"
          label="Client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
        >
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

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Select
          name="contactId"
          label="Contact"
          optional
          defaultValue={defaultValues?.contactId ?? ""}
          disabled={!clientId}
        >
          <option value="">{clientId ? "No contact" : "Select a client first"}</option>
          {clientContacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.fullName}
            </option>
          ))}
        </Select>
        <Select
          name="dealId"
          label="Deal"
          optional
          defaultValue={defaultValues?.dealId ?? ""}
          disabled={!clientId}
        >
          <option value="">{clientId ? "No deal" : "Select a client first"}</option>
          {clientDeals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.name}
            </option>
          ))}
        </Select>
      </div>

      <Input name="name" label="Contract name" defaultValue={defaultValues?.name} required />

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Select name="status" label="Status" defaultValue={defaultValues?.status ?? "DRAFT"}>
          {CONTRACT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CONTRACT_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Input
          name="contractType"
          label="Contract type"
          optional
          defaultValue={defaultValues?.contractType ?? ""}
        />
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input
          name="contractValue"
          type="number"
          min="0"
          step="0.01"
          label="Contract value"
          optional
          defaultValue={defaultValues?.contractValue ?? ""}
        />
        <Input name="currency" label="Currency" optional defaultValue={defaultValues?.currency ?? "USD"} />
      </div>

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
