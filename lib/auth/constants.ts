// Kept separate from session.ts so middleware.ts (Edge runtime) can read the
// cookie name without pulling in session.ts's Prisma/Node-only imports.
export const SESSION_COOKIE_NAME = "cm_session";

// A distinct name (not just a distinct value) from SESSION_COOKIE_NAME, so a
// browser that's both an admin User and (e.g. while testing) a portal Contact
// carries two independent cookies rather than one shared slot either
// principal could clobber. See lib/auth/portal-session.ts.
export const PORTAL_SESSION_COOKIE_NAME = "cm_portal_session";
