import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const PRODUCT_TYPES = ["PRODUCT", "SERVICE"] as const;
export const PRODUCT_UNITS = ["EACH", "HOUR", "DAY", "WEEK", "MONTH", "PROJECT"] as const;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(120),
  code: z.string().trim().min(1, "Product code is required.").max(60),
  family: optionalText(80),
  type: z.enum(PRODUCT_TYPES).default("PRODUCT"),
  unit: z.enum(PRODUCT_UNITS).default("EACH"),
  description: optionalText(2000),
  active: z.coerce.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
