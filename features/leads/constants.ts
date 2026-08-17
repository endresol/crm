// Kept separate from service.ts (no imports at all here) so Client Components
// like LeadForm/LeadsPanel can use these labels without pulling in Prisma/pg —
// see lib/auth/constants.ts for the same pattern applied to auth.

export const LEAD_STATUSES = ["NEW", "UNQUALIFIED", "CONTACTED", "QUALIFIED", "CONVERTED"] as const;

export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatusValue, string> = {
  NEW: "New",
  UNQUALIFIED: "Unqualified",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
};

export const LEAD_STATUS_BADGE_VARIANT: Record<
  LeadStatusValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  NEW: "neutral",
  UNQUALIFIED: "danger",
  CONTACTED: "info",
  QUALIFIED: "primary",
  CONVERTED: "success",
};
