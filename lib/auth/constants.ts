// Kept separate from session.ts so middleware.ts (Edge runtime) can read the
// cookie name without pulling in session.ts's Prisma/Node-only imports.
export const SESSION_COOKIE_NAME = "cm_session";
