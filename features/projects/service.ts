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

/** Returns the pre-update status (for the activity log's "marked as X" vs.
 * plain "updated" phrasing — see statusChangeAction) or null if not found. */
export async function updateProject(workspaceId: string, projectId: string, input: ProjectInput) {
  const before = await prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    select: { status: true },
  });
  if (!before) return null;

  await prisma.project.update({ where: { id: projectId }, data: toData(input) });
  return { previousStatus: before.status };
}

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteProject(workspaceId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    select: { id: true, name: true },
  });
  if (!project) return null;

  await prisma.project.delete({ where: { id: projectId } });
  return project;
}
