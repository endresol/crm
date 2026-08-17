import { z } from "zod";
import { LEAD_STATUSES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  phone: optionalText(40),
  businessName: optionalText(160),
  website: optionalText(200),
  budget: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (!Number.isNaN(value) && value >= 0), {
      message: "Budget must be a positive number.",
    }),
  source: optionalText(80),
  description: optionalText(2000),
  status: z.enum(LEAD_STATUSES).default("NEW"),
});

export type LeadInput = z.infer<typeof leadSchema>;
