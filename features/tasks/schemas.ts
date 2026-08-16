import { z } from "zod";
import { TASK_STATUSES } from "./constants";

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const optionalId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required.").max(160),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  status: z.enum(TASK_STATUSES).default("TODO"),
  milestoneId: optionalId,
  startDate: optionalDate,
  dueDate: optionalDate,
});

export type TaskInput = z.infer<typeof taskSchema>;
