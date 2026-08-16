import "server-only";

import { prisma } from "@/lib/prisma";
import type { MilestoneInput } from "./schemas";

export async function listMilestonesForProject(workspaceId: string, projectId: string) {
  const milestones = await prisma.milestone.findMany({
    where: { workspaceId, projectId },
    include: { tasks: { select: { status: true } } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
  });

  return milestones.map(({ tasks, ...milestone }) => ({
    ...milestone,
    taskCount: tasks.length,
    doneCount: tasks.filter((task) => task.status === "DONE").length,
  }));
}

/** Lightweight list for the Task form's Milestone picker. */
export function listMilestoneOptions(workspaceId: string, projectId: string) {
  return prisma.milestone.findMany({
    where: { workspaceId, projectId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
}

function toData(input: MilestoneInput) {
  return {
    name: input.name,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  };
}

export function createMilestone(workspaceId: string, projectId: string, input: MilestoneInput) {
  return prisma.milestone.create({
    data: { workspaceId, projectId, ...toData(input) },
  });
}

export async function updateMilestone(
  workspaceId: string,
  milestoneId: string,
  input: MilestoneInput,
) {
  const { count } = await prisma.milestone.updateMany({
    where: { id: milestoneId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteMilestone(workspaceId: string, milestoneId: string) {
  const { count } = await prisma.milestone.deleteMany({
    where: { id: milestoneId, workspaceId },
  });
  return count > 0;
}
