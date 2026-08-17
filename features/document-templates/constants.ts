// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels without pulling in Prisma/pg — see lib/auth/constants.ts
// for the same pattern applied to auth.

export const DOCUMENT_TEMPLATE_TYPES = ["PROPOSAL", "CONTRACT", "INVOICE", "QUESTIONNAIRE"] as const;

export type DocumentTemplateTypeValue = (typeof DOCUMENT_TEMPLATE_TYPES)[number];

export const DOCUMENT_TEMPLATE_TYPE_LABELS: Record<DocumentTemplateTypeValue, string> = {
  PROPOSAL: "Proposals",
  CONTRACT: "Contracts",
  INVOICE: "Invoices",
  QUESTIONNAIRE: "Questionnaires",
};
