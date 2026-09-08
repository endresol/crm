import "server-only";

import { prisma } from "@/lib/prisma";
import type { TimeEntryInput, PomodoroTimerInput } from "./schemas";

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

const withPomodoroRelations = {
  client: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  task: { select: { id: true, title: true } },
} as const;

/** The signed-in user's running Pomodoro session, if any — one row per User
 * (see the schema comment on PomodoroTimer). Powers the Sidebar's persistent
 * timer widget, so it's read from the admin layout on every navigation. */
export function getActiveTimer(userId: string) {
  return prisma.pomodoroTimer.findUnique({
    where: { userId },
    include: withPomodoroRelations,
  });
}

export async function startTimer(workspaceId: string, userId: string, input: PomodoroTimerInput) {
  const existing = await prisma.pomodoroTimer.findUnique({ where: { userId } });
  if (existing) {
    return { ok: false as const, reason: "You already have a running timer — stop it before starting a new one." };
  }

  const timer = await prisma.pomodoroTimer.create({
    data: {
      workspaceId,
      userId,
      clientId: input.clientId,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      description: input.description,
      billable: input.billable,
      workMinutes: input.workMinutes,
      shortBreakMinutes: input.shortBreakMinutes,
      longBreakMinutes: input.longBreakMinutes,
      cyclesBeforeLongBreak: input.cyclesBeforeLongBreak,
    },
    include: withPomodoroRelations,
  });
  return { ok: true as const, timer };
}

/** Minutes actually elapsed since `startedAt`, floored at 1 so a phase ended
 * within the same minute it started still logs *something* rather than a
 * silently-dropped 0-minute TimeEntry. */
function elapsedMinutesSince(startedAt: Date): number {
  return Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60_000));
}

function logWorkPhase(workspaceId: string, timer: { userId: string; clientId: string; projectId: string | null; taskId: string | null; description: string | null; billable: boolean; phaseStartedAt: Date }) {
  const elapsedMinutes = elapsedMinutesSince(timer.phaseStartedAt);
  return createTimeEntry(workspaceId, timer.userId, {
    clientId: timer.clientId,
    projectId: timer.projectId ?? undefined,
    taskId: timer.taskId ?? undefined,
    date: new Date().toISOString().slice(0, 10),
    hours: Math.floor(elapsedMinutes / 60),
    minutes: elapsedMinutes % 60,
    description: timer.description ?? undefined,
    billable: timer.billable,
  });
}

/**
 * Advances to the next phase — always a deliberate click (Start break /
 * Start next session), never automatic (see the schema comment on
 * PomodoroTimer). Ending a WORK phase logs a TimeEntry for whatever actually
 * elapsed; ending a break logs nothing. Returns null if there's no running
 * timer (e.g. a stale click after Stop already cleared it elsewhere).
 */
export async function advanceTimerPhase(workspaceId: string, userId: string) {
  const timer = await prisma.pomodoroTimer.findFirst({ where: { userId, workspaceId } });
  if (!timer) return null;

  if (timer.phase === "WORK") {
    await logWorkPhase(workspaceId, timer);
    const nextPhase = timer.cycleNumber >= timer.cyclesBeforeLongBreak ? "LONG_BREAK" : "SHORT_BREAK";
    return prisma.pomodoroTimer.update({
      where: { id: timer.id },
      data: { phase: nextPhase, phaseStartedAt: new Date() },
      include: withPomodoroRelations,
    });
  }

  const nextCycleNumber = timer.phase === "LONG_BREAK" ? 1 : timer.cycleNumber + 1;
  return prisma.pomodoroTimer.update({
    where: { id: timer.id },
    data: { phase: "WORK", cycleNumber: nextCycleNumber, phaseStartedAt: new Date() },
    include: withPomodoroRelations,
  });
}

/** Ends the whole session outright — logs the current WORK phase's elapsed
 * time first (if it is one; a break logs nothing), then deletes the timer.
 * Returns the client/project ids (for the caller's revalidatePath calls) or
 * null if there was nothing running. */
export async function stopTimer(workspaceId: string, userId: string) {
  const timer = await prisma.pomodoroTimer.findFirst({ where: { userId, workspaceId } });
  if (!timer) return null;

  if (timer.phase === "WORK") {
    await logWorkPhase(workspaceId, timer);
  }
  await prisma.pomodoroTimer.delete({ where: { id: timer.id } });
  return { clientId: timer.clientId, projectId: timer.projectId };
}
