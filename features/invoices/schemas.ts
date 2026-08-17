import { z } from "zod";
import { INVOICE_BILLING_TYPES, INVOICE_STATUSES } from "./constants";

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

export const invoiceSchema = z.object({
  clientId: z.string().trim().min(1, "Select a client."),
  contactId: optionalId,
  templateId: optionalId,
  name: z.string().trim().min(1, "Invoice name is required.").max(160),
  billingType: z.enum(INVOICE_BILLING_TYPES).default("ONE_TIME"),
  status: z.enum(INVOICE_STATUSES).default("DRAFT"),
  invoiceDate: z.string().trim().min(1, "Invoice date is required."),
  dueDate: optionalDate,
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

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const lineItemSchema = z.object({
  productId: optionalId,
  description: z.string().trim().min(1, "Description is required.").max(200),
  quantity: z.coerce.number().min(0, "Quantity can't be negative.").default(1),
  unitPrice: z.coerce.number().min(0, "Unit price can't be negative.").default(0),
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
