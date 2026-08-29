import "server-only";

import { prisma } from "@/lib/prisma";
import type { DealInput } from "./schemas";

const withRelations = {
  client: { select: { id: true, name: true } },
  contact: { select: { id: true, fullName: true } },
} as const;

export function listDeals(workspaceId: string) {
  return prisma.deal.findMany({
    where: { workspaceId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function listDealsForClient(workspaceId: string, clientId: string) {
  return prisma.deal.findMany({
    where: { workspaceId, clientId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function getDeal(workspaceId: string, dealId: string) {
  return prisma.deal.findFirst({
    where: { id: dealId, workspaceId },
    include: withRelations,
  });
}

function toData(input: DealInput) {
  return {
    clientId: input.clientId,
    contactId: input.contactId ?? null,
    name: input.name,
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    stage: input.stage,
    priority: input.priority,
    expectedCloseDate: input.expectedCloseDate ? new Date(input.expectedCloseDate) : null,
    nextStep: input.nextStep,
  };
}

export function createDeal(workspaceId: string, input: DealInput) {
  return prisma.deal.create({
    data: { workspaceId, ...toData(input) },
  });
}

/** Returns the pre-update stage (for the activity log's "moved to X" vs.
 * plain "updated" phrasing — see statusChangeAction) or null if not found. */
export async function updateDeal(workspaceId: string, dealId: string, input: DealInput) {
  const before = await prisma.deal.findFirst({ where: { id: dealId, workspaceId }, select: { stage: true } });
  if (!before) return null;

  await prisma.deal.update({ where: { id: dealId }, data: toData(input) });
  return { previousStage: before.stage };
}

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteDeal(workspaceId: string, dealId: string) {
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, workspaceId },
    select: { id: true, name: true },
  });
  if (!deal) return null;

  await prisma.deal.delete({ where: { id: dealId } });
  return deal;
}
