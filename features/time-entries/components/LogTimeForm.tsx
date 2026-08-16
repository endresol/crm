"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { logTimeAction, type TimeEntryActionState } from "../actions";

const initialState: TimeEntryActionState = {};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function LogTimeForm({
  clients,
  fixedClientId,
  onSaved,
  onCancel,
}: {
  clients?: { id: string; name: string }[];
  fixedClientId?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(logTimeAction, initialState);

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

      <Input name="date" type="date" label="Date" defaultValue={todayISO()} required />

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input name="hours" type="number" label="Hours" min={0} defaultValue={0} />
        <Input name="minutes" type="number" label="Minutes" min={0} max={59} defaultValue={0} />
      </div>

      <Input name="description" label="Description" optional placeholder="What did you work on?" />

      <Checkbox name="billable" defaultChecked label="Billable" />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Logging…" : "Log time"}
        </Button>
      </div>
    </form>
  );
}
