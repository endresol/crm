"use client";

import { useActionState, useEffect, useId } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MERGE_FIELD_TOKENS } from "../mergeFields";
import type { DocumentTemplateActionState } from "../actions";
import type { DocumentTemplateTypeValue } from "../constants";

const initialState: DocumentTemplateActionState = {};

export function TemplateForm({
  action,
  type,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (
    prevState: DocumentTemplateActionState,
    formData: FormData,
  ) => Promise<DocumentTemplateActionState>;
  type: DocumentTemplateTypeValue;
  defaultValues?: {
    name?: string;
    category?: string | null;
    description?: string | null;
    content?: string;
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

        <input type="hidden" name="type" value={type} />

        <Input name="name" label="Template name" defaultValue={defaultValues?.name} required />
        <Input
          name="category"
          label="Category"
          optional
          defaultValue={defaultValues?.category ?? ""}
        />
        <Input
          name="description"
          label="Description"
          optional
          defaultValue={defaultValues?.description ?? ""}
        />

        <Textarea
          name="content"
          label="Content"
          rows={12}
          defaultValue={defaultValues?.content ?? ""}
        />
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", marginTop: "calc(-1 * var(--space-3))" }}>
          Merge fields get filled in automatically when a document is created from this
          template: {MERGE_FIELD_TOKENS.map((f) => f.token).join(", ")}
        </p>
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
