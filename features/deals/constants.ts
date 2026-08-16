// Kept separate from service.ts (no imports at all here) so Client Components
// like DealForm/DealBoard can use these labels without pulling in Prisma/pg —
// see lib/auth/constants.ts for the same pattern applied to auth.

export const DEAL_STAGES = [
  "PROSPECTING",
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export type DealStageValue = (typeof DEAL_STAGES)[number];

export const DEAL_STAGE_LABELS: Record<DealStageValue, string> = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export const DEAL_STAGE_COLORS: Record<DealStageValue, string> = {
  PROSPECTING: "#9997ab",
  QUALIFICATION: "#2f7bee",
  PROPOSAL: "#9333ea",
  NEGOTIATION: "#e08e0b",
  CLOSED_WON: "#17a869",
  CLOSED_LOST: "#e0393e",
};

export const DEAL_STAGE_BADGE_VARIANT: Record<
  DealStageValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  PROSPECTING: "neutral",
  QUALIFICATION: "primary",
  PROPOSAL: "info",
  NEGOTIATION: "warning",
  CLOSED_WON: "success",
  CLOSED_LOST: "danger",
};

export const DEAL_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type DealPriorityValue = (typeof DEAL_PRIORITIES)[number];

export const DEAL_PRIORITY_LABELS: Record<DealPriorityValue, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
