import "server-only";

import { prisma } from "@/lib/prisma";
import type { TimeEntryInput } from "./schemas";

export async function listTimeEntriesByClient(workspaceId: string) {
  const clients = await prisma.client.findMany({
    where: { workspaceId },
    include: {
      timeEntries: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((client) => ({
    client,
    totalMinutes: client.timeEntries.reduce((sum, entry) => sum + entry.minutes, 0),
  }));
}

export function listTimeEntriesForClient(workspaceId: string, clientId: string) {
  return prisma.timeEntry.findMany({
    where: { workspaceId, clientId },
    include: {
      user: { select: { name: true } },
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
    orderBy: { date: "desc" },
  });
}

export function listTimeEntriesForProject(workspaceId: string, projectId: string) {
  return prisma.timeEntry.findMany({
    where: { workspaceId, projectId },
    include: {
      user: { select: { name: true } },
      task: { select: { id: true, title: true } },
    },
    orderBy: { date: "desc" },
  });
}

/// Clients with their Projects and each Project's Tasks (id/name only) — feeds the
/// cascading Client → Project → Task selects on the "Log time" form.
export function listClientsForLogging(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      projects: {
        select: {
          id: true,
          name: true,
          tasks: { select: { id: true, title: true }, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export function createTimeEntry(workspaceId: string, userId: string, input: TimeEntryInput) {
  return prisma.timeEntry.create({
    data: {
      workspaceId,
      userId,
      clientId: input.clientId,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      minutes: input.hours * 60 + input.minutes,
      description: input.description,
      date: new Date(input.date),
      billable: input.billable,
    },
  });
}

export async function deleteTimeEntry(workspaceId: string, entryId: string) {
  const { count } = await prisma.timeEntry.deleteMany({
    where: { id: entryId, workspaceId },
  });
  return count > 0;
}

export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}
