// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels/helpers without pulling in Prisma/pg — see
// lib/auth/constants.ts for the same pattern applied to auth.

export const INVOICE_BILLING_TYPES = ["ONE_TIME", "RECURRING"] as const;
export type InvoiceBillingTypeValue = (typeof INVOICE_BILLING_TYPES)[number];
export const INVOICE_BILLING_TYPE_LABELS: Record<InvoiceBillingTypeValue, string> = {
  ONE_TIME: "One-time",
  RECURRING: "Recurring",
};

export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"] as const;
export type InvoiceStatusValue = (typeof INVOICE_STATUSES)[number];
export const INVOICE_STATUS_LABELS: Record<InvoiceStatusValue, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  VOID: "Void",
};
export const INVOICE_STATUS_BADGE_VARIANT: Record<
  InvoiceStatusValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "neutral",
  SENT: "info",
  PAID: "success",
  OVERDUE: "danger",
  VOID: "warning",
};

/** A line's (quantity × unit price) — pure, so both the server and a live
 * client-side total-as-you-type preview can share it. */
export function lineItemTotal(item: { quantity: number; unitPrice: number }): number {
  return item.quantity * item.unitPrice;
}

export function invoiceTotal(lineItems: { quantity: number; unitPrice: number }[]): number {
  return lineItems.reduce((sum, item) => sum + lineItemTotal(item), 0);
}
