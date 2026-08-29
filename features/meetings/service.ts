import "server-only";

import { prisma } from "@/lib/prisma";
import { computeAvailableSlots } from "./slots";
import type { AvailabilityRuleInput, BookingInput, MeetingScheduleInput } from "./schemas";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "schedule"
  );
}

/** Appends -2, -3, ... until the slug is free — schedule names aren't unique
 * (two workspaces can both have a "15 min call"), but the public URL is. */
async function uniqueSlug(base: string, excludeId?: string) {
  const slug = slugify(base);
  for (let suffix = 1; ; suffix++) {
    const candidate = suffix === 1 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.meetingSchedule.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
  }
}

export function listSchedules(workspaceId: string) {
  return prisma.meetingSchedule.findMany({
    where: { workspaceId },
    include: { _count: { select: { meetings: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Just the bookable ones — for the Client Portal and any other "pick a
 * meeting type" surface, where an inactive schedule shouldn't be offered. */
export function listActiveSchedules(workspaceId: string) {
  return prisma.meetingSchedule.findMany({
    where: { workspaceId, active: true },
    select: { id: true, name: true, description: true, durationMinutes: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getSchedule(workspaceId: string, scheduleId: string) {
  return prisma.meetingSchedule.findFirst({
    where: { id: scheduleId, workspaceId },
    include: { availabilityRules: { orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }] } },
  });
}

/** Public — no workspace scoping, since the booking page is reached by slug
 * alone. `active: true` is enforced here rather than left to the caller, so
 * a disabled schedule's link 404s instead of silently still taking bookings. */
export function getScheduleBySlug(slug: string) {
  return prisma.meetingSchedule.findFirst({
    where: { slug, active: true },
    include: {
      availabilityRules: true,
      workspace: { select: { name: true, timezone: true, logoUrl: true, accentColor: true, backgroundColor: true } },
    },
  });
}

export async function createSchedule(workspaceId: string, input: MeetingScheduleInput) {
  const slug = await uniqueSlug(input.name);
  return prisma.meetingSchedule.create({
    data: {
      workspaceId,
      slug,
      name: input.name,
      description: input.description ?? null,
      durationMinutes: input.durationMinutes,
      bufferMinutes: input.bufferMinutes,
      minNoticeHours: input.minNoticeHours,
      maxAdvanceDays: input.maxAdvanceDays,
      active: input.active,
    },
  });
}

export async function updateSchedule(
  workspaceId: string,
  scheduleId: string,
  input: MeetingScheduleInput,
) {
  const { count } = await prisma.meetingSchedule.updateMany({
    where: { id: scheduleId, workspaceId },
    data: {
      name: input.name,
      description: input.description ?? null,
      durationMinutes: input.durationMinutes,
      bufferMinutes: input.bufferMinutes,
      minNoticeHours: input.minNoticeHours,
      maxAdvanceDays: input.maxAdvanceDays,
      active: input.active,
    },
  });
  return count > 0;
}

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteSchedule(workspaceId: string, scheduleId: string) {
  const schedule = await prisma.meetingSchedule.findFirst({
    where: { id: scheduleId, workspaceId },
    select: { id: true, name: true },
  });
  if (!schedule) return null;

  await prisma.meetingSchedule.delete({ where: { id: scheduleId } });
  return schedule;
}

/** Fully replaces the rule set — see the comment on availabilityRulesSchema
 * in schemas.ts for why this is a replace, not a diff. */
export async function setAvailabilityRules(
  workspaceId: string,
  scheduleId: string,
  rules: AvailabilityRuleInput[],
) {
  const schedule = await prisma.meetingSchedule.findFirst({
    where: { id: scheduleId, workspaceId },
    select: { id: true },
  });
  if (!schedule) return { ok: false as const, reason: "That schedule no longer exists." };

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany({ where: { meetingScheduleId: scheduleId } }),
    prisma.availabilityRule.createMany({
      data: rules.map((rule) => ({ ...rule, meetingScheduleId: scheduleId })),
    }),
  ]);
  return { ok: true as const };
}

const withMeetingRelations = {
  // Just `id`, for a "manage this schedule" link — display name always comes
  // from Meeting.scheduleName (the snapshot), not this relation, since it's
  // nullable once a schedule is deleted. See the schema comment on Meeting.
  meetingSchedule: { select: { id: true } },
  client: { select: { id: true, name: true } },
  contact: { select: { id: true, fullName: true } },
} as const;

export function listMeetings(workspaceId: string) {
  return prisma.meeting.findMany({
    where: { workspaceId },
    include: withMeetingRelations,
    orderBy: { startAt: "desc" },
  });
}

export function listMeetingsForClient(workspaceId: string, clientId: string) {
  return prisma.meeting.findMany({
    where: { workspaceId, clientId },
    include: withMeetingRelations,
    orderBy: { startAt: "desc" },
  });
}

export function listMeetingsForContact(workspaceId: string, contactId: string) {
  return prisma.meeting.findMany({
    where: { workspaceId, contactId },
    include: withMeetingRelations,
    orderBy: { startAt: "desc" },
  });
}

export function listMeetingsForSchedule(workspaceId: string, scheduleId: string) {
  return prisma.meeting.findMany({
    where: { workspaceId, meetingScheduleId: scheduleId },
    include: withMeetingRelations,
    orderBy: { startAt: "desc" },
  });
}

/** Returns the meeting (enough to label an activity log entry) or null if it
 * doesn't belong to this workspace. */
export async function cancelMeeting(workspaceId: string, meetingId: string) {
  const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, workspaceId } });
  if (!meeting) return null;

  await prisma.meeting.update({ where: { id: meetingId }, data: { status: "CANCELLED" } });
  return meeting;
}

/** Same as cancelMeeting, scoped to the booking Contact instead of a
 * workspace — this is the Client Portal's "cancel my meeting" action. */
export async function cancelMeetingForContact(contactId: string, meetingId: string) {
  const meeting = await prisma.meeting.findFirst({ where: { id: meetingId, contactId } });
  if (!meeting) return null;

  await prisma.meeting.update({ where: { id: meetingId }, data: { status: "CANCELLED" } });
  return meeting;
}

/** Slot start times a booker could pick right now, in the schedule's
 * workspace's timezone. Re-run at booking time too (see bookMeeting) — this
 * is what the picker shows, not a hold on the slot. */
export async function getAvailableSlots(scheduleId: string) {
  const schedule = await prisma.meetingSchedule.findUnique({
    where: { id: scheduleId },
    include: { availabilityRules: true, workspace: { select: { timezone: true } } },
  });
  if (!schedule || !schedule.active) return [];

  const busy = await prisma.meeting.findMany({
    where: { meetingScheduleId: scheduleId, status: "CONFIRMED", endAt: { gte: new Date() } },
    select: { startAt: true, endAt: true },
  });

  return computeAvailableSlots({
    rules: schedule.availabilityRules,
    busy,
    durationMinutes: schedule.durationMinutes,
    bufferMinutes: schedule.bufferMinutes,
    minNoticeHours: schedule.minNoticeHours,
    maxAdvanceDays: schedule.maxAdvanceDays,
    timeZone: schedule.workspace.timezone,
  });
}

/**
 * Books a Meeting, re-checking the slot is still free right before
 * inserting — the picker's slot list can go stale between page load and
 * submit (another booker took it, or the admin edited availability).
 * There's no DB-level exclusion constraint backing this (a genuine gap under
 * true concurrent bookings), which is an acceptable trim for a low-traffic
 * scheduling tool rather than the infrastructure a public Calendly-scale
 * product would need.
 */
export async function bookMeeting(
  scheduleId: string,
  input: BookingInput,
  attribution: { clientId?: string | null; contactId?: string | null } = {},
) {
  const schedule = await prisma.meetingSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule || !schedule.active) {
    return { ok: false as const, reason: "This meeting type is no longer available." };
  }

  const startAt = new Date(input.startAt);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false as const, reason: "Pick a valid time." };
  }
  const endAt = new Date(startAt.getTime() + schedule.durationMinutes * 60_000);

  const bufferMs = schedule.bufferMinutes * 60_000;
  const conflict = await prisma.meeting.findFirst({
    where: {
      meetingScheduleId: scheduleId,
      status: "CONFIRMED",
      startAt: { lt: new Date(endAt.getTime() + bufferMs) },
      endAt: { gt: new Date(startAt.getTime() - bufferMs) },
    },
  });
  if (conflict) {
    return { ok: false as const, reason: "That time was just booked — please pick another." };
  }

  const meeting = await prisma.meeting.create({
    data: {
      workspaceId: schedule.workspaceId,
      meetingScheduleId: scheduleId,
      scheduleName: schedule.name,
      clientId: attribution.clientId ?? null,
      contactId: attribution.contactId ?? null,
      bookerName: input.bookerName,
      bookerEmail: input.bookerEmail,
      startAt,
      endAt,
      notes: input.notes ?? null,
    },
  });
  return { ok: true as const, meeting };
}
