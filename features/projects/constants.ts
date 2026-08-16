// Kept separate from service.ts (no imports at all here) so Client Components
// like ProjectForm can use these labels without pulling in Prisma/pg — see
// lib/auth/constants.ts for the same pattern applied to auth.

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
};

export const PROJECT_STATUS_BADGE_VARIANT: Record<
  string,
  "neutral" | "primary" | "success" | "warning"
> = {
  PLANNING: "neutral",
  IN_PROGRESS: "primary",
  ON_HOLD: "warning",
  COMPLETED: "success",
};
