import "server-only";

import { prisma } from "@/lib/prisma";
import { SOP_BOILERPLATE } from "./constants";
import type { SopInput } from "./schemas";

export function listSops(workspaceId: string) {
  return prisma.sop.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });
}

export function getSop(workspaceId: string, sopId: string) {
  return prisma.sop.findFirst({ where: { id: sopId, workspaceId } });
}

/** "Create SOP" auto-creates a draft pre-filled with the boilerplate template. */
export function createSop(workspaceId: string) {
  return prisma.sop.create({
    data: { workspaceId, title: "Untitled SOP", content: SOP_BOILERPLATE },
  });
}

export async function updateSop(workspaceId: string, sopId: string, input: SopInput) {
  const { count } = await prisma.sop.updateMany({
    where: { id: sopId, workspaceId },
    data: { title: input.title, content: input.content },
  });
  return count > 0;
}

export async function deleteSop(workspaceId: string, sopId: string) {
  const { count } = await prisma.sop.deleteMany({
    where: { id: sopId, workspaceId },
  });
  return count > 0;
}
