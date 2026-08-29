import "server-only";

import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/uploads";
import type { ContactInput } from "./schemas";

// Excludes portalPasswordHash — Contact records returned from here flow into
// "use client" components (e.g. EditContactButton's `contact` prop) as whole
// objects, and whatever's in that object crosses the server/client boundary
// regardless of which fields the component actually reads. Same reasoning as
// features/profile/service.ts's SAFE_SELECT for User.passwordHash.
const SAFE_SELECT = {
  id: true,
  workspaceId: true,
  clientId: true,
  fullName: true,
  jobTitle: true,
  email: true,
  phone: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function listContacts(workspaceId: string) {
  return prisma.contact.findMany({
    where: { workspaceId },
    select: { ...SAFE_SELECT, client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listContactsForClient(workspaceId: string, clientId: string) {
  return prisma.contact.findMany({
    where: { workspaceId, clientId },
    select: SAFE_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export function getContact(workspaceId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    select: { ...SAFE_SELECT, client: { select: { id: true, name: true } } },
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

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteContact(workspaceId: string, contactId: string) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    select: { id: true, fullName: true },
  });
  if (!contact) return null;

  await prisma.contact.delete({ where: { id: contactId } });
  return contact;
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

/** Whether this Contact currently has Client Portal login credentials. */
export async function hasPortalAccess(workspaceId: string, contactId: string) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    select: { portalPasswordHash: true },
  });
  return Boolean(contact?.portalPasswordHash);
}

/**
 * Sets (or, with `passwordHash: null`, revokes) a Contact's portal login.
 * Clears any existing PortalSessions either way — a password reset or a
 * revoke should both immediately invalidate whatever's already logged in,
 * not just block future logins.
 */
export async function setContactPortalPassword(
  workspaceId: string,
  contactId: string,
  passwordHash: string | null,
) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    select: { id: true, email: true },
  });
  if (!contact) return { ok: false as const, reason: "That contact no longer exists." };
  if (passwordHash && !contact.email) {
    return { ok: false as const, reason: "Add an email address before enabling portal access." };
  }

  await prisma.$transaction([
    prisma.contact.update({ where: { id: contactId }, data: { portalPasswordHash: passwordHash } }),
    prisma.portalSession.deleteMany({ where: { contactId } }),
  ]);
  return { ok: true as const };
}
