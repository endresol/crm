import { z } from "zod";
import { PROPOSAL_STATUSES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

const optionalId = optionalText(120);

export const proposalSchema = z.object({
  clientId: z.string().trim().min(1, "Select a client."),
  contactId: optionalId,
  templateId: optionalId,
  name: z.string().trim().min(1, "Proposal title is required.").max(160),
  status: z.enum(PROPOSAL_STATUSES).default("DRAFT"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .max(6)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : "USD")),
  notes: optionalText(20000),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

export const proposalLineItemSchema = z.object({
  productId: optionalId,
  description: z.string().trim().min(1, "Description is required.").max(200),
  quantity: z.coerce.number().min(0, "Quantity can't be negative.").default(1),
  unitPrice: z.coerce.number().min(0, "Unit price can't be negative.").default(0),
});

export type ProposalLineItemInput = z.infer<typeof proposalLineItemSchema>;
