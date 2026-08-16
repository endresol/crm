"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DEAL_PRIORITIES, DEAL_PRIORITY_LABELS, DEAL_STAGES, DEAL_STAGE_LABELS } from "../constants";
import type { DealActionState } from "../actions";

const initialState: DealActionState = {};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function DealForm({
  action,
  clients,
  contacts,
  fixedClientId,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (prevState: DealActionState, formData: FormData) => Promise<DealActionState>;
  clients?: { id: string; name: string }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  fixedClientId?: string;
  defaultValues?: {
    clientId?: string;
    contactId?: string | null;
    name?: string;
    description?: string | null;
    amount?: number;
    currency?: string;
    stage?: string;
    priority?: string;
    expectedCloseDate?: Date | string | null;
    nextStep?: string | null;
  };
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
  footerExtra?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formId = useId();
  const [clientId, setClientId] = useState(fixedClientId ?? defaultValues?.clientId ?? "");
  const clientContacts = contacts.filter((contact) => contact.clientId === clientId);

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

        <Input name="name" label="Deal name" defaultValue={defaultValues?.name} required />

        <Textarea
          name="description"
          label="Description"
          optional
          defaultValue={defaultValues?.description ?? ""}
        />

        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            label="Amount"
            defaultValue={defaultValues?.amount ?? 0}
          />
          <Input
            name="currency"
            label="Currency"
            optional
            defaultValue={defaultValues?.currency ?? "USD"}
          />
        </div>

        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Select name="stage" label="Stage" defaultValue={defaultValues?.stage ?? "PROSPECTING"}>
            {DEAL_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {DEAL_STAGE_LABELS[stage]}
              </option>
            ))}
          </Select>
          <Select
            name="priority"
            label="Priority"
            defaultValue={defaultValues?.priority ?? "MEDIUM"}
          >
            {DEAL_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {DEAL_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </div>

        <Input
          name="expectedCloseDate"
          type="date"
          label="Expected close date"
          optional
          defaultValue={toDateInputValue(defaultValues?.expectedCloseDate)}
        />

        <Input
          name="nextStep"
          label="Next step"
          optional
          defaultValue={defaultValues?.nextStep ?? ""}
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
