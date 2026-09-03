// Pure merge-field substitution — no imports, so both server actions and the
// client-side compose modal (live preview as you pick a template, same as
// InvoiceForm.tsx does with document-templates/mergeFields.ts) share the
// exact same logic without pulling in Prisma/pg. Superset of
// document-templates/mergeFields.ts's tokens plus ones specific to a sent
// email: `record` for whichever Invoice/Proposal/Contract/Questionnaire the
// send is about, `meeting`/`portal` for the two automatic trigger types (see
// the EmailTemplateType schema comment). Deliberately no {{record.url}}: it
// would point at the admin app, which a client can't reach and (per the
// Client Portal's own trim) has no per-document view to send them to yet —
// {{meeting.url}}/{{portal.loginUrl}} are the client-reachable equivalents
// for the two types that do have one.

export const EMAIL_MERGE_FIELD_TOKENS: { token: string; description: string }[] = [
  { token: "{{client.name}}", description: "The client's name" },
  { token: "{{client.email}}", description: "The client's email" },
  { token: "{{contact.name}}", description: "The recipient contact's name" },
  { token: "{{workspace.name}}", description: "Your workspace's name" },
  { token: "{{today}}", description: "Today's date" },
  { token: "{{record.name}}", description: "The Invoice/Proposal/Contract/Questionnaire's name" },
  { token: "{{record.amount}}", description: "Its total amount, when it has one" },
  { token: "{{record.dueDate}}", description: "Its due date, when it has one (Invoice)" },
  { token: "{{meeting.time}}", description: "The booked meeting's date and time" },
  { token: "{{meeting.scheduleName}}", description: "The meeting type's name" },
  { token: "{{meeting.bookerName}}", description: "Who booked the meeting" },
  { token: "{{meeting.url}}", description: "Link to view/manage the booking" },
  { token: "{{portal.loginUrl}}", description: "Link to the Client Portal login page" },
];

export type EmailMergeFieldContext = {
  client?: { name?: string | null; email?: string | null };
  contact?: { name?: string | null };
  workspace?: { name?: string | null };
  today?: string;
  record?: { name?: string | null; amount?: string | null; dueDate?: string | null };
  meeting?: { time?: string | null; scheduleName?: string | null; bookerName?: string | null; url?: string | null };
  portal?: { loginUrl?: string | null };
};

export function substituteEmailMergeFields(content: string, context: EmailMergeFieldContext): string {
  return content
    .replaceAll("{{client.name}}", context.client?.name ?? "")
    .replaceAll("{{client.email}}", context.client?.email ?? "")
    .replaceAll("{{contact.name}}", context.contact?.name ?? "")
    .replaceAll("{{workspace.name}}", context.workspace?.name ?? "")
    .replaceAll("{{today}}", context.today ?? "")
    .replaceAll("{{record.name}}", context.record?.name ?? "")
    .replaceAll("{{record.amount}}", context.record?.amount ?? "")
    .replaceAll("{{record.dueDate}}", context.record?.dueDate ?? "")
    .replaceAll("{{meeting.time}}", context.meeting?.time ?? "")
    .replaceAll("{{meeting.scheduleName}}", context.meeting?.scheduleName ?? "")
    .replaceAll("{{meeting.bookerName}}", context.meeting?.bookerName ?? "")
    .replaceAll("{{meeting.url}}", context.meeting?.url ?? "")
    .replaceAll("{{portal.loginUrl}}", context.portal?.loginUrl ?? "");
}
