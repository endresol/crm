import { z } from "zod";
import { DEAL_PRIORITIES, DEAL_STAGES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

const optionalId = optionalText(120);
const optionalDate = optionalText(20);

export const dealSchema = z.object({
  clientId: z.string().trim().min(1, "Select a client."),
  contactId: optionalId,
  name: z.string().trim().min(1, "Deal name is required.").max(160),
  description: optionalText(2000),
  amount: z.coerce.number().min(0, "Amount can't be negative.").default(0),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .max(6)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : "USD")),
  stage: z.enum(DEAL_STAGES).default("PROSPECTING"),
  priority: z.enum(DEAL_PRIORITIES).default("MEDIUM"),
  expectedCloseDate: optionalDate,
  nextStep: optionalText(500),
});

export type DealInput = z.infer<typeof dealSchema>;
