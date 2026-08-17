"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { substituteMergeFields } from "@/features/document-templates/mergeFields";
import {
  INVOICE_BILLING_TYPES,
  INVOICE_BILLING_TYPE_LABELS,
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
} from "../constants";
import type { InvoiceActionState } from "../actions";

const initialState: InvoiceActionState = {};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function InvoiceForm({
  action,
  clients,
  contacts,
  templates,
  workspaceName,
  fixedClientId,
  defaultValues,
  submitLabel,
  onCancel,
}: {
  action: (prevState: InvoiceActionState, formData: FormData) => Promise<InvoiceActionState>;
  clients?: { id: string; name: string; email?: string | null }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string; content: string }[];
  workspaceName: string;
  fixedClientId?: string;
  defaultValues?: {
    name?: string;
    contactId?: string | null;
    templateId?: string | null;
    billingType?: string;
    status?: string;
    invoiceDate?: Date | string | null;
    dueDate?: Date | string | null;
    currency?: string;
    notes?: string | null;
  };
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const [templateId, setTemplateId] = useState(defaultValues?.templateId ?? "");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const clientContacts = contacts.filter((contact) => contact.clientId === clientId);

  function fillFromTemplate() {
    const template = templates.find((t) => t.id === templateId);
    const client = clients?.find((c) => c.id === clientId);
    if (!template) return;
    setNotes(
      substituteMergeFields(template.content, {
        client: client ? { name: client.name, email: client.email } : undefined,
        workspace: { name: workspaceName },
        today: new Date().toLocaleDateString("en-US"),
      }),
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

      {templates.length > 0 && (
        <Select
          name="templateId"
          label="Template"
          optional
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
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

      <Input name="name" label="Invoice name" defaultValue={defaultValues?.name} required />

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Select
          name="billingType"
          label="Billing type"
          defaultValue={defaultValues?.billingType ?? "ONE_TIME"}
        >
          {INVOICE_BILLING_TYPES.map((type) => (
            <option key={type} value={type}>
              {INVOICE_BILLING_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Select name="status" label="Status" defaultValue={defaultValues?.status ?? "DRAFT"}>
          {INVOICE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {INVOICE_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input
          name="invoiceDate"
          type="date"
          label="Invoice date"
          defaultValue={toDateInputValue(defaultValues?.invoiceDate) || toDateInputValue(new Date())}
          required
        />
        <Input
          name="dueDate"
          type="date"
          label="Due date"
          optional
          defaultValue={toDateInputValue(defaultValues?.dueDate)}
        />
      </div>

      <Input name="currency" label="Currency" optional defaultValue={defaultValues?.currency ?? "USD"} />

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-1)",
          }}
        >
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)" }}>
            Notes
          </span>
          {templateId && (
            <Button type="button" variant="ghost" size="sm" onClick={fillFromTemplate}>
              Fill from template
            </Button>
          )}
        </div>
        <Textarea name="notes" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
