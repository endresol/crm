import "server-only";

import { prisma } from "@/lib/prisma";
import type { TaskInput } from "./schemas";

export function listTasksForProject(workspaceId: string, projectId: string) {
  return prisma.task.findMany({
    where: { workspaceId, projectId },
    include: { milestone: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export function getTask(workspaceId: string, taskId: string) {
  return prisma.task.findFirst({ where: { id: taskId, workspaceId } });
}

function toData(input: TaskInput) {
  return {
    title: input.title,
    description: input.description,
    status: input.status,
    milestoneId: input.milestoneId ?? null,
    startDate: input.startDate ? new Date(input.startDate) : null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  };
}

export function createTask(workspaceId: string, projectId: string, input: TaskInput) {
  return prisma.task.create({
    data: { workspaceId, projectId, ...toData(input) },
  });
}

export async function updateTask(workspaceId: string, taskId: string, input: TaskInput) {
  const { count } = await prisma.task.updateMany({
    where: { id: taskId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteTask(workspaceId: string, taskId: string) {
  const { count } = await prisma.task.deleteMany({
    where: { id: taskId, workspaceId },
  });
  return count > 0;
}
