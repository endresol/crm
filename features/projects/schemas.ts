import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"] as const;

export const projectSchema = z.object({
  clientId: z.string().trim().min(1, "Choose a client."),
  name: z.string().trim().min(1, "Project name is required.").max(120),
  description: optionalText(2000),
  status: z.enum(PROJECT_STATUSES).default("PLANNING"),
  startDate: optionalDate,
  endDate: optionalDate,
});

export type ProjectInput = z.infer<typeof projectSchema>;
