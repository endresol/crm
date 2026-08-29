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

/** Returns the pre-update status (for the activity log's "marked as X" vs.
 * plain "updated" phrasing — see statusChangeAction) or null if not found. */
export async function updateTask(workspaceId: string, taskId: string, input: TaskInput) {
  const before = await prisma.task.findFirst({ where: { id: taskId, workspaceId }, select: { status: true } });
  if (!before) return null;

  await prisma.task.update({ where: { id: taskId }, data: toData(input) });
  return { previousStatus: before.status };
}

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteTask(workspaceId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
    select: { id: true, title: true },
  });
  if (!task) return null;

  await prisma.task.delete({ where: { id: taskId } });
  return task;
}
