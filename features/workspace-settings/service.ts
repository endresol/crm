import "server-only";

import { prisma } from "@/lib/prisma";
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
