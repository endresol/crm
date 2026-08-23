import "server-only";

import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/uploads";
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

/**
 * Points the client at a newly uploaded logo and cleans up the one it
 * replaces. See features/profile/service.ts:setAvatar for the same pattern.
 */
export async function setClientLogo(workspaceId: string, clientId: string, url: string | null) {
  const current = await prisma.client.findFirst({
    where: { id: clientId, workspaceId },
    select: { logoUrl: true },
  });
  if (!current) return { ok: false as const, reason: "That client no longer exists." };

  await prisma.client.update({ where: { id: clientId }, data: { logoUrl: url } });
  if (current.logoUrl && current.logoUrl !== url) {
    await deleteImage(current.logoUrl);
  }
  return { ok: true as const };
}
