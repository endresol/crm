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
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
}

export function createTimeEntry(workspaceId: string, userId: string, input: TimeEntryInput) {
  return prisma.timeEntry.create({
    data: {
      workspaceId,
      userId,
      clientId: input.clientId,
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
