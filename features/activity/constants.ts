// Kept separate from service.ts (no imports at all here) so Client Components
// (the filter dropdown, the feed row icons) can use these labels without
// pulling in Prisma/pg — see lib/auth/constants.ts for the same pattern
// applied to auth.

export const ACTIVITY_ENTITY_TYPES = [
  "CLIENT",
  "CONTACT",
  "DEAL",
  "LEAD",
  "PROJECT",
  "TASK",
  "MILESTONE",
  "INVOICE",
  "PROPOSAL",
  "CONTRACT",
  "QUESTIONNAIRE",
  "MEETING",
  "TEAM_MEMBER",
  "WORKSPACE",
] as const;

export type ActivityEntityTypeValue = (typeof ACTIVITY_ENTITY_TYPES)[number];

export const ACTIVITY_ENTITY_TYPE_LABELS: Record<ActivityEntityTypeValue, string> = {
  CLIENT: "Client",
  CONTACT: "Contact",
  DEAL: "Deal",
  LEAD: "Lead",
  PROJECT: "Project",
  TASK: "Task",
  MILESTONE: "Milestone",
  INVOICE: "Invoice",
  PROPOSAL: "Proposal",
  CONTRACT: "Contract",
  QUESTIONNAIRE: "Questionnaire",
  MEETING: "Meeting",
  TEAM_MEMBER: "Team member",
  WORKSPACE: "Workspace",
};
