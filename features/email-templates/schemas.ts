import { z } from "zod";
import { EMAIL_TEMPLATE_TYPES } from "./constants";

export const emailTemplateSchema = z.object({
  type: z.enum(EMAIL_TEMPLATE_TYPES),
  name: z.string().trim().min(1, "Template name is required.").max(160),
  subject: z.string().trim().min(1, "Subject is required.").max(200),
  body: z.string().max(20000).optional().default(""),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

/** The compose-and-send form (SendEmailForm) — subject/body arrive already
 * merge-filled (the client-side live preview did the substitution before
 * submit, same as InvoiceForm's "fill from template" pattern), so this only
 * validates shape, not tokens. */
export const sendEmailSchema = z.object({
  templateId: z.string().min(1).optional().or(z.literal("")).transform((v) => v || undefined),
  to: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Subject is required.").max(200),
  body: z.string().trim().min(1, "Message is required.").max(20000),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
