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

/** Returns the pre-update status (for the activity log's "marked as X" vs.
 * plain "updated" phrasing — see statusChangeAction) or null if not found. */
export async function updateProposal(workspaceId: string, proposalId: string, input: ProposalInput) {
  const before = await prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId },
    select: { status: true },
  });
  if (!before) return null;

  await prisma.proposal.update({ where: { id: proposalId }, data: toData(input) });
  return { previousStatus: before.status };
}

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteProposal(workspaceId: string, proposalId: string) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId },
    select: { id: true, name: true },
  });
  if (!proposal) return null;

  await prisma.proposal.delete({ where: { id: proposalId } });
  return proposal;
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
