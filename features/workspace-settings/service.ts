import "server-only";

import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/uploads";
import type { WorkspaceSettingsInput } from "./schemas";

export function getWorkspace(workspaceId: string) {
  return prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
}

export async function updateWorkspaceSettings(workspaceId: string, input: WorkspaceSettingsInput) {
  const { count } = await prisma.workspace.updateMany({
    where: { id: workspaceId },
    data: input,
  });
  return count > 0;
}

/**
 * Points the workspace at a newly uploaded logo and cleans up the one it
 * replaces — same ordering as profile/service.ts's setAvatar: update the row
 * first so a failed cleanup leaves an orphaned blob, never a dangling URL.
 */
export async function setWorkspaceLogo(workspaceId: string, url: string | null) {
  const current = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { logoUrl: true },
  });
  if (!current) return { ok: false as const, reason: "That workspace no longer exists." };

  await prisma.workspace.update({ where: { id: workspaceId }, data: { logoUrl: url } });
  if (current.logoUrl && current.logoUrl !== url) {
    await deleteImage(current.logoUrl);
  }
  return { ok: true as const };
}
