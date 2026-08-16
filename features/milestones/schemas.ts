import { z } from "zod";

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const milestoneSchema = z.object({
  name: z.string().trim().min(1, "Milestone name is required.").max(160),
  dueDate: optionalDate,
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;
