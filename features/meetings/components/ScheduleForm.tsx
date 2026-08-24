"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import type { ScheduleActionState } from "../actions";

const initialState: ScheduleActionState = {};

export function ScheduleForm({
  action,
  defaultValues,
  submitLabel,
  onCancel,
}: {
  action: (prevState: ScheduleActionState, formData: FormData) => Promise<ScheduleActionState>;
  defaultValues?: {
    name?: string;
    description?: string | null;
    durationMinutes?: number;
    bufferMinutes?: number;
    minNoticeHours?: number;
    maxAdvanceDays?: number;
    active?: boolean;
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

      <Input
        name="name"
        label="Name of schedule"
        placeholder="e.g. 15 min Discovery Call"
        defaultValue={defaultValues?.name}
        required
      />
      <Textarea
        name="description"
        label="Description (shown to whoever's booking)"
        optional
        rows={2}
        defaultValue={defaultValues?.description ?? ""}
      />

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input
          name="durationMinutes"
          type="number"
          min="5"
          step="5"
          label="Duration (minutes)"
          defaultValue={defaultValues?.durationMinutes ?? 30}
          required
        />
        <Input
          name="bufferMinutes"
          type="number"
          min="0"
          step="5"
          label="Buffer between meetings"
          defaultValue={defaultValues?.bufferMinutes ?? 0}
        />
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input
          name="minNoticeHours"
          type="number"
          min="0"
          label="Minimum notice (hours)"
          defaultValue={defaultValues?.minNoticeHours ?? 4}
        />
        <Input
          name="maxAdvanceDays"
          type="number"
          min="1"
          label="Bookable up to (days out)"
          defaultValue={defaultValues?.maxAdvanceDays ?? 30}
        />
      </div>

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
