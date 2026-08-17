import { z } from "zod";

export const sopSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : "Untitled SOP")),
  content: z.string().max(50000).optional().default(""),
});

export type SopInput = z.infer<typeof sopSchema>;
