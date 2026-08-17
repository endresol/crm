import "server-only";

import { prisma } from "@/lib/prisma";
import type { CalendarEventInput } from "./schemas";

/** All events that overlap [rangeStart, rangeEnd) — used to fill a month grid,
 * including the leading/trailing days from adjacent months it shows. */
export function listEventsInRange(workspaceId: string, rangeStart: Date, rangeEnd: Date) {
  return prisma.calendarEvent.findMany({
    where: {
      workspaceId,
      startAt: { lt: rangeEnd },
      endAt: { gte: rangeStart },
    },
    orderBy: { startAt: "asc" },
  });
}

export function getCalendarEvent(workspaceId: string, eventId: string) {
  return prisma.calendarEvent.findFirst({ where: { id: eventId, workspaceId } });
}

function toData(input: CalendarEventInput) {
  return {
    title: input.title,
    startAt: new Date(input.startAt),
    endAt: new Date(input.endAt),
  };
}

export function createCalendarEvent(workspaceId: string, userId: string, input: CalendarEventInput) {
  return prisma.calendarEvent.create({
    data: { workspaceId, userId, ...toData(input) },
  });
}

export async function updateCalendarEvent(
  workspaceId: string,
  eventId: string,
  input: CalendarEventInput,
) {
  const { count } = await prisma.calendarEvent.updateMany({
    where: { id: eventId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteCalendarEvent(workspaceId: string, eventId: string) {
  const { count } = await prisma.calendarEvent.deleteMany({
    where: { id: eventId, workspaceId },
  });
  return count > 0;
}
