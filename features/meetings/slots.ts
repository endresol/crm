// Pure slot-computation logic — no Prisma/server imports, so it's easy to
// reason about (and unit-test) independent of how the rules/busy times were
// fetched. features/meetings/service.ts is the only caller today, but
// nothing here stops a future client-side "next available" preview from
// importing it directly.

import { zonedTimeToUtc } from "@/lib/timezone";

export type AvailabilityRuleInput = { dayOfWeek: number; startMinute: number; endMinute: number };
export type BusyInterval = { startAt: Date; endAt: Date };

export function computeAvailableSlots({
  rules,
  busy,
  durationMinutes,
  bufferMinutes,
  minNoticeHours,
  maxAdvanceDays,
  timeZone,
  now = new Date(),
}: {
  rules: AvailabilityRuleInput[];
  busy: BusyInterval[];
  durationMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  timeZone: string;
  now?: Date;
}): Date[] {
  if (durationMinutes <= 0) return [];

  const earliestStart = new Date(now.getTime() + minNoticeHours * 60 * 60_000);
  const todayLocal = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  const anchor = new Date(
    Date.UTC(Number(todayLocal.year), Number(todayLocal.month) - 1, Number(todayLocal.day)),
  );

  const slots: Date[] = [];

  for (let dayOffset = 0; dayOffset <= maxAdvanceDays; dayOffset++) {
    // Plain calendar-date arithmetic (JS handles month/day rollover) — a
    // Gregorian calendar date's day-of-week doesn't depend on timezone, so
    // this UTC-anchored math is exactly the local calendar day, no
    // conversion needed for *which day it is* (only for *what time*, below).
    const day = new Date(anchor.getTime() + dayOffset * 86_400_000);
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    const dayOfWeek = day.getUTCDay();

    for (const rule of rules) {
      if (rule.dayOfWeek !== dayOfWeek) continue;

      for (
        let minute = rule.startMinute;
        minute + durationMinutes <= rule.endMinute;
        minute += durationMinutes
      ) {
        const slotStart = zonedTimeToUtc(y, m, d, Math.floor(minute / 60), minute % 60, timeZone);
        if (slotStart < earliestStart) continue;

        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);
        const conflicts = busy.some((b) => {
          const busyStart = new Date(b.startAt.getTime() - bufferMinutes * 60_000);
          const busyEnd = new Date(b.endAt.getTime() + bufferMinutes * 60_000);
          return slotStart < busyEnd && slotEnd > busyStart;
        });
        if (!conflicts) slots.push(slotStart);
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}
