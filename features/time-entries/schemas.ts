import { z } from "zod";

// Exported — pomodoroSchemas.ts reuses this for the same "no project/task
// selected yet" shape (a select that isn't rendered yet posts nothing, not
// "").
export const optionalId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const optionalDescription = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const timeEntrySchema = z
  .object({
    clientId: z.string().trim().min(1, "Choose a client."),
    projectId: optionalId,
    taskId: optionalId,
    date: z.string().trim().min(1, "Choose a date."),
    hours: z.coerce.number().int().min(0).max(999),
    minutes: z.coerce.number().int().min(0).max(59),
    description: optionalDescription,
    billable: z.coerce.boolean().default(true),
  })
  .refine((data) => data.hours > 0 || data.minutes > 0, {
    message: "Enter a duration greater than zero.",
    path: ["minutes"],
  })
  .refine((data) => !data.taskId || data.projectId, {
    message: "A task must belong to a project.",
    path: ["taskId"],
  });

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

// A single work interval maxes out well under a day — 480 min (8h) is a
// generous ceiling that still catches a fat-fingered entry.
export const pomodoroTimerSchema = z
  .object({
    clientId: z.string().trim().min(1, "Choose a client."),
    projectId: optionalId,
    taskId: optionalId,
    description: optionalDescription,
    billable: z.coerce.boolean().default(true),
    workMinutes: z.coerce.number().int().min(1).max(480).default(25),
    shortBreakMinutes: z.coerce.number().int().min(1).max(480).default(5),
    longBreakMinutes: z.coerce.number().int().min(1).max(480).default(20),
    cyclesBeforeLongBreak: z.coerce.number().int().min(1).max(12).default(4),
  })
  .refine((data) => !data.taskId || data.projectId, {
    message: "A task must belong to a project.",
    path: ["taskId"],
  });

export type PomodoroTimerInput = z.infer<typeof pomodoroTimerSchema>;
