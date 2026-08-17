"use client";

import { useActionState, useEffect, useId } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CalendarEventActionState } from "../actions";

const initialState: CalendarEventActionState = {};

export function EventForm({
  action,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (
    prevState: CalendarEventActionState,
    formData: FormData,
  ) => Promise<CalendarEventActionState>;
  defaultValues?: { title?: string; startAt?: string; endAt?: string };
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
  footerExtra?: React.ReactNode;
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

        <Input
          name="title"
          label="What is this event about?"
          defaultValue={defaultValues?.title}
          required
        />

        <Input
          name="startAt"
          type="datetime-local"
          label="Start"
          defaultValue={defaultValues?.startAt}
          required
        />
        <Input
          name="endAt"
          type="datetime-local"
          label="End"
          defaultValue={defaultValues?.endAt}
          required
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
