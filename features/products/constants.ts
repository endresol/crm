// Kept separate from service.ts (no imports at all here) so Client Components
// like ProductForm can use these labels without pulling in Prisma/pg — see
// lib/auth/constants.ts for the same pattern applied to auth.

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  PRODUCT: "Product",
  SERVICE: "Service",
};

export const PRODUCT_UNIT_LABELS: Record<string, string> = {
  EACH: "Each",
  HOUR: "Hour",
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  PROJECT: "Project",
};
