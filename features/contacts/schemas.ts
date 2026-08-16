import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const contactSchema = z.object({
  clientId: z.string().trim().min(1, "Select a client."),
  fullName: z.string().trim().min(1, "Full name is required.").max(120),
  jobTitle: optionalText(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  phone: optionalText(40),
});

export type ContactInput = z.infer<typeof contactSchema>;
