// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels without pulling in Prisma/pg — see lib/auth/constants.ts
// for the same pattern applied to auth.

export const ROLE_LABELS: Record<string, string> = {
  MASTER_ADMIN: "Master Admin",
  MEMBER: "Member",
};
