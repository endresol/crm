import "server-only";

import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/uploads";
import type { ContactInput } from "./schemas";

export function listContacts(workspaceId: string) {
  return prisma.contact.findMany({
    where: { workspaceId },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listContactsForClient(workspaceId: string, clientId: string) {
  return prisma.contact.findMany({
    where: { workspaceId, clientId },
    orderBy: { createdAt: "desc" },
  });
}

export function getContact(workspaceId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    include: { client: { select: { id: true, name: true } } },
  });
}

export function createContact(workspaceId: string, input: ContactInput) {
  return prisma.contact.create({
    data: { workspaceId, ...input },
  });
}

export async function updateContact(workspaceId: string, contactId: string, input: ContactInput) {
  const { count } = await prisma.contact.updateMany({
    where: { id: contactId, workspaceId },
    data: input,
  });
  return count > 0;
}

export async function deleteContact(workspaceId: string, contactId: string) {
  const { count } = await prisma.contact.deleteMany({
    where: { id: contactId, workspaceId },
  });
  return count > 0;
}

/**
 * Points the contact at a newly uploaded photo and cleans up the one it
 * replaces. See features/profile/service.ts:setAvatar for the same pattern.
 */
export async function setContactAvatar(
  workspaceId: string,
  contactId: string,
  url: string | null,
) {
  const current = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    select: { avatarUrl: true },
  });
  if (!current) return { ok: false as const, reason: "That contact no longer exists." };

  await prisma.contact.update({ where: { id: contactId }, data: { avatarUrl: url } });
  if (current.avatarUrl && current.avatarUrl !== url) {
    await deleteImage(current.avatarUrl);
  }
  return { ok: true as const };
}
