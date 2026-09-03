"use client";

import { useActionState, useEffect, useId } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EMAIL_MERGE_FIELD_TOKENS } from "../mergeFields";
import { EMAIL_TEMPLATE_TYPES, EMAIL_TEMPLATE_TYPE_LABELS } from "../constants";
import type { EmailTemplateActionState } from "../actions";
import type { EmailTemplateTypeValue } from "../constants";

const initialState: EmailTemplateActionState = {};

export function EmailTemplateForm({
  action,
  defaultValues,
  submitLabel,
  onSaved,
  onCancel,
  footerExtra,
}: {
  action: (
    prevState: EmailTemplateActionState,
    formData: FormData,
  ) => Promise<EmailTemplateActionState>;
  defaultValues?: {
    type?: EmailTemplateTypeValue;
    name?: string;
    subject?: string;
    body?: string;
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

        <Select name="type" label="Trigger" defaultValue={defaultValues?.type ?? "CUSTOM"}>
          {EMAIL_TEMPLATE_TYPES.map((type) => (
            <option key={type} value={type}>
              {EMAIL_TEMPLATE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>

        <Input name="name" label="Template name" defaultValue={defaultValues?.name} required />
        <Input
          name="subject"
          label="Subject"
          defaultValue={defaultValues?.subject}
          required
        />
        <Textarea
          name="body"
          label="Message"
          rows={12}
          defaultValue={defaultValues?.body ?? ""}
        />
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
            marginTop: "calc(-1 * var(--space-3))",
          }}
        >
          Merge fields get filled in when this template is used:{" "}
          {EMAIL_MERGE_FIELD_TOKENS.map((f) => f.token).join(", ")}
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
