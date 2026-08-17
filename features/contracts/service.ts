import "server-only";

import { prisma } from "@/lib/prisma";
import type { ContractContentInput, ContractInput } from "./schemas";

const withRelations = {
  client: { select: { id: true, name: true } },
  contact: { select: { id: true, fullName: true } },
  deal: { select: { id: true, name: true } },
} as const;

export function listContracts(workspaceId: string) {
  return prisma.contract.findMany({
    where: { workspaceId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function listContractsForClient(workspaceId: string, clientId: string) {
  return prisma.contract.findMany({
    where: { workspaceId, clientId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function getContract(workspaceId: string, contractId: string) {
  return prisma.contract.findFirst({
    where: { id: contractId, workspaceId },
    include: {
      ...withRelations,
      template: { select: { id: true, name: true, content: true } },
    },
  });
}

function toData(input: ContractInput) {
  return {
    clientId: input.clientId,
    contactId: input.contactId ?? null,
    dealId: input.dealId ?? null,
    templateId: input.templateId ?? null,
    name: input.name,
    status: input.status,
    contractType: input.contractType ?? null,
    contractValue: input.contractValue ?? null,
    currency: input.currency,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
  };
}

export function createContract(workspaceId: string, input: ContractInput) {
  return prisma.contract.create({
    data: { workspaceId, ...toData(input) },
  });
}

export async function updateContract(workspaceId: string, contractId: string, input: ContractInput) {
  const { count } = await prisma.contract.updateMany({
    where: { id: contractId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function updateContractContent(
  workspaceId: string,
  contractId: string,
  input: ContractContentInput,
) {
  const { count } = await prisma.contract.updateMany({
    where: { id: contractId, workspaceId },
    data: { content: input.content },
  });
  return count > 0;
}

export async function deleteContract(workspaceId: string, contractId: string) {
  const { count } = await prisma.contract.deleteMany({
    where: { id: contractId, workspaceId },
  });
  return count > 0;
}
