import { z } from "zod";
import { DOCUMENT_TEMPLATE_TYPES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const documentTemplateSchema = z.object({
  type: z.enum(DOCUMENT_TEMPLATE_TYPES),
  name: z.string().trim().min(1, "Template name is required.").max(160),
  category: optionalText(80),
  description: optionalText(500),
  content: z.string().max(20000).optional().default(""),
});

export type DocumentTemplateInput = z.infer<typeof documentTemplateSchema>;
