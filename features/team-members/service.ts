import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import type { TeamMemberInput } from "./schemas";

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export function listTeamMembers(workspaceId: string) {
  return prisma.user.findMany({
    where: { workspaceId },
    select: SAFE_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

export async function emailTaken(email: string) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return existing !== null;
}

export async function createTeamMember(workspaceId: string, input: TeamMemberInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      workspaceId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: SAFE_SELECT,
  });
}

/** Refuses to demote the workspace's last remaining Master Admin — same reasoning as deleteTeamMember. */
export async function updateTeamMemberRole(workspaceId: string, userId: string, role: TeamMemberInput["role"]) {
  const [target, adminCount] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, workspaceId }, select: { role: true } }),
    prisma.user.count({ where: { workspaceId, role: "MASTER_ADMIN" } }),
  ]);

  if (!target) return { ok: false as const, reason: "That team member no longer exists." };
  if (target.role === "MASTER_ADMIN" && role !== "MASTER_ADMIN" && adminCount <= 1) {
    return { ok: false as const, reason: "You can't demote the only Master Admin." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { ok: true as const };
}

/**
 * Removes a member. Guards against locking a workspace out of its own admin
 * app: refuses to delete the last remaining user, and refuses to delete the
 * last remaining Master Admin (a workspace with only MEMBERs and no admin has
 * no one left who can manage it, in this trimmed no-permission-system MVP).
 */
export async function deleteTeamMember(workspaceId: string, userId: string) {
  const [target, totalCount, adminCount] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, workspaceId }, select: { role: true } }),
    prisma.user.count({ where: { workspaceId } }),
    prisma.user.count({ where: { workspaceId, role: "MASTER_ADMIN" } }),
  ]);

  if (!target) return { ok: false as const, reason: "That team member no longer exists." };
  if (totalCount <= 1) {
    return { ok: false as const, reason: "You can't remove the only member of a workspace." };
  }
  if (target.role === "MASTER_ADMIN" && adminCount <= 1) {
    return { ok: false as const, reason: "You can't remove the only Master Admin." };
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true as const };
}
