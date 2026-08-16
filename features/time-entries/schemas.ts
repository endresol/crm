import { z } from "zod";

export const timeEntrySchema = z
  .object({
    clientId: z.string().trim().min(1, "Choose a client."),
    date: z.string().trim().min(1, "Choose a date."),
    hours: z.coerce.number().int().min(0).max(999),
    minutes: z.coerce.number().int().min(0).max(59),
    description: z
      .string()
      .trim()
      .max(500)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    billable: z.coerce.boolean().default(true),
  })
  .refine((data) => data.hours > 0 || data.minutes > 0, {
    message: "Enter a duration greater than zero.",
    path: ["minutes"],
  });

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
