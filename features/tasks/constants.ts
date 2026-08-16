// No imports here on purpose — this file is safe to import from Client
// Components (kanban board, forms) without pulling Prisma/pg into the browser
// bundle. See features/projects/constants.ts for the same pattern.

export const TASK_STATUSES = ["TODO", "DOING", "READY_FOR_QA", "BLOCKED", "DONE"] as const;

export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  TODO: "To Do",
  DOING: "Doing",
  READY_FOR_QA: "Ready for QA",
  BLOCKED: "Blocked",
  DONE: "Done",
};

// Matches the real product's Gantt-chart legend colors.
export const TASK_STATUS_COLORS: Record<TaskStatusValue, string> = {
  TODO: "#9997ab",
  DOING: "#2f7bee",
  READY_FOR_QA: "#9333ea",
  BLOCKED: "#e0393e",
  DONE: "#17a869",
};
