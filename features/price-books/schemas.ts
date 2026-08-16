import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const priceBookSchema = z.object({
  name: z.string().trim().min(1, "Price book name is required.").max(120),
  description: optionalText(2000),
});

export type PriceBookInput = z.infer<typeof priceBookSchema>;

export const priceBookEntrySchema = z.object({
  productId: z.string().trim().min(1, "Choose a product."),
  unitPrice: z.coerce.number().nonnegative("Enter a price of 0 or more."),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(8)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : "USD")),
});

export type PriceBookEntryInput = z.infer<typeof priceBookEntrySchema>;
