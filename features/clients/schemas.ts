import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required.").max(120),
  legalName: optionalText(160),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  website: optionalText(200),
  industry: optionalText(80),
});

export type ClientInput = z.infer<typeof clientSchema>;
