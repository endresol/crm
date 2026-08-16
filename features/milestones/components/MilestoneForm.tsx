"use client";

import { useActionState, useEffect, useId } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { MilestoneActionState } from "../actions";

const initialState: MilestoneActionState = {};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function MilestoneForm({
  action,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (prevState: MilestoneActionState, formData: FormData) => Promise<MilestoneActionState>;
  defaultValues?: { name?: string; dueDate?: Date | string | null };
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
      {/* footerExtra's delete <form> stays a sibling of this form, not nested — see
          features/tasks/components/TaskForm.tsx for why. */}
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

        <Input name="name" label="Milestone name" defaultValue={defaultValues?.name} required />

        <Input
          name="dueDate"
          type="date"
          label="Due date"
          optional
          defaultValue={toDateInputValue(defaultValues?.dueDate)}
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
