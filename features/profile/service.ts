import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { deleteImage } from "@/lib/uploads";
import type { PasswordChangeInput, ProfileInput } from "./schemas";

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export function getProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: SAFE_SELECT });
}

/** Scoped by workspace as well as id so a stale session can't edit across tenants. */
export async function updateProfile(workspaceId: string, userId: string, input: ProfileInput) {
  const taken = await prisma.user.findFirst({
    where: { email: input.email, id: { not: userId } },
    select: { id: true },
  });
  if (taken) return { ok: false as const, reason: "That email is already in use." };

  const { count } = await prisma.user.updateMany({
    where: { id: userId, workspaceId },
    data: { name: input.name, email: input.email },
  });
  if (count === 0) return { ok: false as const, reason: "Your account no longer exists." };

  return { ok: true as const };
}

export async function changePassword(userId: string, input: PasswordChangeInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) return { ok: false as const, reason: "Your account no longer exists." };

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) return { ok: false as const, reason: "That's not your current password." };

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
  return { ok: true as const };
}

/**
 * Points the user at a newly uploaded avatar and cleans up the one it replaces.
 * The delete happens after the row is updated, so a failed cleanup leaves an
 * orphaned blob rather than a row pointing at a file that's already gone.
 */
export async function setAvatar(workspaceId: string, userId: string, url: string | null) {
  const current = await prisma.user.findFirst({
    where: { id: userId, workspaceId },
    select: { avatarUrl: true },
  });
  if (!current) return { ok: false as const, reason: "Your account no longer exists." };

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });
  if (current.avatarUrl && current.avatarUrl !== url) {
    await deleteImage(current.avatarUrl);
  }
  return { ok: true as const };
}
