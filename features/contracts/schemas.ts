import { z } from "zod";
import { CONTRACT_STATUSES } from "./constants";

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

const optionalAmount = z
  .union([z.coerce.number().min(0, "Value can't be negative."), z.literal("")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

export const contractSchema = z.object({
  clientId: z.string().trim().min(1, "Select a client."),
  contactId: optionalId,
  dealId: optionalId,
  templateId: optionalId,
  name: z.string().trim().min(1, "Contract name is required.").max(160),
  status: z.enum(CONTRACT_STATUSES).default("DRAFT"),
  contractType: optionalText(80),
  contractValue: optionalAmount,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .max(6)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : "USD")),
  startDate: optionalDate,
  endDate: optionalDate,
});

export type ContractInput = z.infer<typeof contractSchema>;

export const contractContentSchema = z.object({
  content: z.string().max(50000).optional().default(""),
});

export type ContractContentInput = z.infer<typeof contractContentSchema>;
