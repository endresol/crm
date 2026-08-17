// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels/helpers without pulling in Prisma/pg — see
// lib/auth/constants.ts for the same pattern applied to auth.

export const PROPOSAL_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "DECLINED"] as const;
export type ProposalStatusValue = (typeof PROPOSAL_STATUSES)[number];
export const PROPOSAL_STATUS_LABELS: Record<ProposalStatusValue, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};
export const PROPOSAL_STATUS_BADGE_VARIANT: Record<
  ProposalStatusValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "neutral",
  SENT: "info",
  ACCEPTED: "success",
  DECLINED: "danger",
};

/** A line's (quantity × unit price) — pure, so both the server and a live
 * client-side total-as-you-type preview can share it. */
export function lineItemTotal(item: { quantity: number; unitPrice: number }): number {
  return item.quantity * item.unitPrice;
}

export function proposalTotal(lineItems: { quantity: number; unitPrice: number }[]): number {
  return lineItems.reduce((sum, item) => sum + lineItemTotal(item), 0);
}
