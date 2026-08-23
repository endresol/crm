// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels without pulling in Prisma/pg — see lib/auth/constants.ts
// for the same pattern applied to auth.

export const QUESTIONNAIRE_STATUSES = ["DRAFT", "SENT", "COMPLETED"] as const;
export type QuestionnaireStatusValue = (typeof QUESTIONNAIRE_STATUSES)[number];
export const QUESTIONNAIRE_STATUS_LABELS: Record<QuestionnaireStatusValue, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  COMPLETED: "Completed",
};
export const QUESTIONNAIRE_STATUS_BADGE_VARIANT: Record<
  QuestionnaireStatusValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "neutral",
  SENT: "info",
  COMPLETED: "success",
};
