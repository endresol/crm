import "server-only";

import { prisma } from "@/lib/prisma";
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
