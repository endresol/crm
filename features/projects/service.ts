import "server-only";

import { prisma } from "@/lib/prisma";
import type { ProjectInput } from "./schemas";

export function listProjects(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listProjectsForClient(workspaceId: string, clientId: string) {
  return prisma.project.findMany({
    where: { workspaceId, clientId },
    orderBy: { createdAt: "desc" },
  });
}

export function getProject(workspaceId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    include: { client: { select: { id: true, name: true } } },
  });
}

function toData(input: ProjectInput) {
  return {
    clientId: input.clientId,
    name: input.name,
    description: input.description,
    status: input.status,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
  };
}

export function createProject(workspaceId: string, input: ProjectInput) {
  return prisma.project.create({
    data: { workspaceId, ...toData(input) },
  });
}

export async function updateProject(workspaceId: string, projectId: string, input: ProjectInput) {
  const { count } = await prisma.project.updateMany({
    where: { id: projectId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteProject(workspaceId: string, projectId: string) {
  const { count } = await prisma.project.deleteMany({
    where: { id: projectId, workspaceId },
  });
  return count > 0;
}
