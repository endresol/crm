"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { sendTemplatedEmailAction } from "../actions";
import type { SendEmailActionState } from "../actions";
import { EMAIL_MERGE_FIELD_TOKENS, substituteEmailMergeFields } from "../mergeFields";
import type { EmailMergeFieldContext } from "../mergeFields";
import { MANUAL_SEND_EMAIL_TEMPLATE_TYPES } from "../constants";
import type { EmailTemplateTypeValue } from "../constants";
import type { ActivityEntityTypeValue } from "@/features/activity/constants";

const initialState: SendEmailActionState = {};

type TemplateOption = {
  id: string;
  type: EmailTemplateTypeValue;
  name: string;
  subject: string;
  body: string;
};

/**
 * "Send Email" entry point shared by the Invoice/Proposal/Contract/
 * Questionnaire detail pages (roadmap #21 — manual send only, see
 * docs/roadmap.md). Each call site just supplies its own entity identity and
 * merge-field context; the actual send goes through the one shared
 * sendTemplatedEmailAction.
 */
export function SendEmailButton({
  entityType,
  url,
  activityLabel,
  revalidatePaths,
  templates,
  defaultTemplateType,
  defaultTo,
  mergeContext,
}: {
  entityType: ActivityEntityTypeValue;
  url: string;
  /** Noun phrase for the Activity feed sentence — "Invoice Website Retainer". */
  activityLabel: string;
  revalidatePaths: string[];
  templates: TemplateOption[];
  /** Which EmailTemplate type to preselect, e.g. "INVOICE_SENT" from the
   * Invoice detail page — falls back to the first available template. */
  defaultTemplateType?: EmailTemplateTypeValue;
  /** The Contact's email if one is set on the record, else the Client's. */
  defaultTo?: string | null;
  mergeContext: EmailMergeFieldContext;
}) {
  const [open, setOpen] = useState(false);
  const manualTemplates = templates.filter((t) => MANUAL_SEND_EMAIL_TEMPLATE_TYPES.includes(t.type));

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        disabled={!defaultTo}
        title={!defaultTo ? "Add an email address for this client or contact first" : undefined}
      >
        Send Email
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Send email">
        <SendEmailForm
          action={sendTemplatedEmailAction.bind(null, entityType, url, activityLabel, revalidatePaths)}
          templates={manualTemplates}
          defaultTemplateType={defaultTemplateType}
          defaultTo={defaultTo ?? ""}
          mergeContext={mergeContext}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}

function SendEmailForm({
  action,
  templates,
  defaultTemplateType,
  defaultTo,
  mergeContext,
  onSaved,
  onCancel,
}: {
  action: (prevState: SendEmailActionState, formData: FormData) => Promise<SendEmailActionState>;
  templates: TemplateOption[];
  defaultTemplateType?: EmailTemplateTypeValue;
  defaultTo: string;
  mergeContext: EmailMergeFieldContext;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formId = useId();

  const preselected =
    templates.find((t) => t.type === defaultTemplateType) ?? templates[0] ?? null;
  const [templateId, setTemplateId] = useState(preselected?.id ?? "");
  const [subject, setSubject] = useState(
    preselected ? substituteEmailMergeFields(preselected.subject, mergeContext) : "",
  );
  const [body, setBody] = useState(
    preselected ? substituteEmailMergeFields(preselected.body, mergeContext) : "",
  );

  useEffect(() => {
    if (state.success && onSaved) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  function selectTemplate(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setSubject(substituteEmailMergeFields(template.subject, mergeContext));
    setBody(substituteEmailMergeFields(template.body, mergeContext));
  }

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

        <input type="hidden" name="templateId" value={templateId} />

        {templates.length > 0 && (
          <Select
            label="Template"
            optional
            value={templateId}
            onChange={(e) => selectTemplate(e.target.value)}
          >
            <option value="">— Blank —</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        )}

        <Input name="to" label="To" type="email" defaultValue={defaultTo} required />
        <Input
          name="subject"
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <Textarea
          name="body"
          label="Message"
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
            marginTop: "calc(-1 * var(--space-3))",
          }}
        >
          Merge fields: {EMAIL_MERGE_FIELD_TOKENS.map((f) => f.token).join(", ")}
        </p>
      </form>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--space-3)",
        }}
      >
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" form={formId} disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </div>
    </>
  );
}
