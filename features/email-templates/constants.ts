// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels without pulling in Prisma/pg — see lib/auth/constants.ts
// for the same pattern applied to auth, and features/document-templates/
// constants.ts for the same pattern applied to Document templates.

export const EMAIL_TEMPLATE_TYPES = [
  "INVOICE_SENT",
  "INVOICE_OVERDUE",
  "PROPOSAL_SENT",
  "CONTRACT_SENT",
  "QUESTIONNAIRE_SENT",
  "MEETING_CONFIRMATION",
  "MEETING_CANCELLED",
  "PORTAL_INVITE",
  "CUSTOM",
] as const;

export type EmailTemplateTypeValue = (typeof EMAIL_TEMPLATE_TYPES)[number];

export const EMAIL_TEMPLATE_TYPE_LABELS: Record<EmailTemplateTypeValue, string> = {
  INVOICE_SENT: "Invoice sent",
  INVOICE_OVERDUE: "Invoice overdue",
  PROPOSAL_SENT: "Proposal sent",
  CONTRACT_SENT: "Contract sent",
  QUESTIONNAIRE_SENT: "Questionnaire sent",
  MEETING_CONFIRMATION: "Meeting confirmation",
  MEETING_CANCELLED: "Meeting cancelled",
  PORTAL_INVITE: "Client Portal invite",
  CUSTOM: "Custom",
};

/** The types a human ever picks from a "Send Email" button — the three
 * system-triggered types (MEETING_CONFIRMATION/MEETING_CANCELLED/
 * PORTAL_INVITE) are sent automatically instead (see the EmailTemplateType
 * schema comment), so they're excluded from that picker but still editable
 * on the Email Templates settings page like everything else. */
// Typed as the full EmailTemplateTypeValue[] (not the narrowed literal union
// .filter() would otherwise infer) so callers can check an arbitrary
// EmailTemplate's `.type` against it with `.includes()`.
export const MANUAL_SEND_EMAIL_TEMPLATE_TYPES: EmailTemplateTypeValue[] = EMAIL_TEMPLATE_TYPES.filter(
  (type) => type !== "MEETING_CONFIRMATION" && type !== "MEETING_CANCELLED" && type !== "PORTAL_INVITE",
);

export const EMAIL_STATUSES = ["SENT", "FAILED"] as const;
export type EmailStatusValue = (typeof EMAIL_STATUSES)[number];

export const EMAIL_STATUS_LABELS: Record<EmailStatusValue, string> = {
  SENT: "Sent",
  FAILED: "Failed",
};

export const EMAIL_STATUS_BADGE_VARIANT: Record<EmailStatusValue, "success" | "danger"> = {
  SENT: "success",
  FAILED: "danger",
};
