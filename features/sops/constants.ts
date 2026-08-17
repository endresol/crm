// Boilerplate content a new SOP starts with — matches the real product's
// pre-filled template (see docs/feature-audit/12-sops.md). Kept separate from
// service.ts (no imports at all here) so it can be reused without pulling in
// Prisma/pg — see lib/auth/constants.ts for the same pattern applied to auth.

export const SOP_BOILERPLATE = `Standard Operating Procedure (SOP)

Objective
The objective of this SOP is to provide clear guidelines for [specific purpose, e.g., handling customer support tickets].

Scope
This SOP applies to all employees involved in [specific area, e.g., customer service, product quality checks].

Responsibilities
`;
