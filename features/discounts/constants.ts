// Kept separate from service.ts (no imports at all here) so Client Components
// like DiscountForm can use these labels without pulling in Prisma/pg — see
// lib/auth/constants.ts for the same pattern applied to auth.

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "Percentage (%)",
  FIXED_AMOUNT: "Fixed amount",
};
