import "server-only";

import { prisma } from "@/lib/prisma";
import type { ProposalInput, ProposalLineItemInput } from "./schemas";

const withRelations = {
  client: { select: { id: true, name: true } },
  contact: { select: { id: true, fullName: true } },
  lineItems: true,
} as const;

export function listProposals(workspaceId: string) {
  return prisma.proposal.findMany({
    where: { workspaceId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function listProposalsForClient(workspaceId: string, clientId: string) {
  return prisma.proposal.findMany({
    where: { workspaceId, clientId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function getProposal(workspaceId: string, proposalId: string) {
  return prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId },
    include: {
      ...withRelations,
      template: { select: { id: true, name: true } },
      lineItems: { include: { product: { select: { id: true, name: true } } } },
    },
  });
}

function toData(input: ProposalInput) {
  return {
    clientId: input.clientId,
    contactId: input.contactId ?? null,
    templateId: input.templateId ?? null,
    name: input.name,
    status: input.status,
    currency: input.currency,
    notes: input.notes,
  };
}

export function createProposal(workspaceId: string, input: ProposalInput) {
  return prisma.proposal.create({
    data: { workspaceId, ...toData(input) },
  });
}

export async function updateProposal(workspaceId: string, proposalId: string, input: ProposalInput) {
  const { count } = await prisma.proposal.updateMany({
    where: { id: proposalId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteProposal(workspaceId: string, proposalId: string) {
  const { count } = await prisma.proposal.deleteMany({
    where: { id: proposalId, workspaceId },
  });
  return count > 0;
}

export function addLineItem(workspaceId: string, proposalId: string, input: ProposalLineItemInput) {
  return prisma.proposalLineItem.create({
    data: { workspaceId, proposalId, ...input, productId: input.productId ?? null },
  });
}

export async function updateLineItem(
  workspaceId: string,
  lineItemId: string,
  input: ProposalLineItemInput,
) {
  const { count } = await prisma.proposalLineItem.updateMany({
    where: { id: lineItemId, workspaceId },
    data: { ...input, productId: input.productId ?? null },
  });
  return count > 0;
}

export async function deleteLineItem(workspaceId: string, lineItemId: string) {
  const { count } = await prisma.proposalLineItem.deleteMany({
    where: { id: lineItemId, workspaceId },
  });
  return count > 0;
}
