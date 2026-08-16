import "server-only";

import { prisma } from "@/lib/prisma";
import type { ClientInput } from "./schemas";

export function listClients(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export function getClient(workspaceId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, workspaceId },
  });
}

export function createClient(workspaceId: string, input: ClientInput) {
  return prisma.client.create({
    data: { workspaceId, ...input },
  });
}

export async function updateClient(workspaceId: string, clientId: string, input: ClientInput) {
  const { count } = await prisma.client.updateMany({
    where: { id: clientId, workspaceId },
    data: input,
  });
  return count > 0;
}

export async function deleteClient(workspaceId: string, clientId: string) {
  const { count } = await prisma.client.deleteMany({
    where: { id: clientId, workspaceId },
  });
  return count > 0;
}
