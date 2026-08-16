"use client";

import { useActionState, useEffect, useId } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../constants";
import type { TaskActionState } from "../actions";

const initialState: TaskActionState = {};

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function TaskForm({
  action,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (prevState: TaskActionState, formData: FormData) => Promise<TaskActionState>;
  defaultValues?: {
    title?: string;
    description?: string | null;
    status?: string;
    dueDate?: Date | string | null;
  };
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
      {/* footerExtra (the Delete button below) is its own <form> — keeping it as a
          sibling rather than nesting it inside this form avoids invalid/nested
          <form> HTML. The submit button below references this form by id instead. */}
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

        <Input name="title" label="Title" defaultValue={defaultValues?.title} required />

        <Textarea
          name="description"
          label="Description"
          optional
          defaultValue={defaultValues?.description ?? ""}
        />

        <Select name="status" label="Status" defaultValue={defaultValues?.status ?? "TODO"}>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

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
