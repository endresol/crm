// Kept separate from service.ts (no imports at all here) so Client Components
// can use these labels without pulling in Prisma/pg — see lib/auth/constants.ts
// for the same pattern applied to auth.

export const MEETING_STATUSES = ["CONFIRMED", "CANCELLED"] as const;
export type MeetingStatusValue = (typeof MEETING_STATUSES)[number];
export const MEETING_STATUS_LABELS: Record<MeetingStatusValue, string> = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};
export const MEETING_STATUS_BADGE_VARIANT: Record<
  MeetingStatusValue,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  CONFIRMED: "success",
  CANCELLED: "neutral",
};

export const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_LABELS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "9:00 AM" from minutes-from-midnight — used by the availability editor and
 * nowhere near a Date object, since a rule's minute is a wall-clock offset,
 * not an instant. */
export function formatMinuteOfDay(minute: number): string {
  const hour24 = Math.floor(minute / 60);
  const min = minute % 60;
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(min).padStart(2, "0")} ${period}`;
}
