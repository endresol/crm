// Converts a "wall clock" date/time in an IANA timezone to the UTC instant
// it represents, and back. No date library needed — Intl.DateTimeFormat can
// already render a UTC instant as parts in any zone; the missing direction
// (zone + wall clock -> instant) is the standard fixed-point trick below,
// used internally by libraries like date-fns-tz. Written from scratch here
// rather than adding a dependency, since Meeting Scheduler (roadmap #19) is
// the first feature in this app where getting a timezone wrong is directly
// user-visible (a booking page showing the wrong time isn't a cosmetic bug,
// it's a client showing up to the wrong slot).

/** Minutes to add to a UTC instant to get that zone's local wall-clock time. */
function offsetMinutesAt(instant: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUtc - instant.getTime()) / 60_000;
}

/**
 * The UTC instant at which it is `hour:minute` on `year-month-day` in
 * `timeZone`. Iterates to a fixed point (3 passes is always enough for real
 * timezones — offsets only change by whole hours, at most twice a year) so a
 * date near a DST transition still resolves correctly.
 */
export function zonedTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  let instant = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let i = 0; i < 3; i++) {
    const offset = offsetMinutesAt(instant, timeZone);
    const corrected = new Date(Date.UTC(year, month - 1, day, hour, minute) - offset * 60_000);
    if (corrected.getTime() === instant.getTime()) break;
    instant = corrected;
  }
  return instant;
}
