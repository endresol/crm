// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels without pulling in Prisma/pg — see lib/auth/constants.ts
// for the same pattern applied to auth.

export const CONTRACT_STATUSES = ["DRAFT", "SENT", "SIGNED", "EXPIRED"] as const;
export type ContractStatusValue = (typeof CONTRACT_STATUSES)[number];
export const CONTRACT_STATUS_LABELS: Record<ContractStatusValue, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  SIGNED: "Signed",
  EXPIRED: "Expired",
};
export const CONTRACT_STATUS_BADGE_VARIANT: Record<
  ContractStatusValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "neutral",
  SENT: "info",
  SIGNED: "success",
  EXPIRED: "warning",
};
