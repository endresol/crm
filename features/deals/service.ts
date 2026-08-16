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

export async function updateDeal(workspaceId: string, dealId: string, input: DealInput) {
  const { count } = await prisma.deal.updateMany({
    where: { id: dealId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteDeal(workspaceId: string, dealId: string) {
  const { count } = await prisma.deal.deleteMany({
    where: { id: dealId, workspaceId },
  });
  return count > 0;
}
