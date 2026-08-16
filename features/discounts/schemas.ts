import { z } from "zod";

export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"] as const;

export const discountSchema = z
  .object({
    name: z.string().trim().min(1, "Give this discount a name.").max(120),
    type: z.enum(DISCOUNT_TYPES).default("PERCENTAGE"),
    value: z.coerce.number().positive("Enter a value greater than zero."),
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.value <= 100, {
    message: "A percentage discount can't exceed 100.",
    path: ["value"],
  });

export type DiscountInput = z.infer<typeof discountSchema>;
