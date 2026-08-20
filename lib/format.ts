// Date/currency formatting helpers used across the app. Always pass an
// explicit locale to Intl/toLocaleDateString — leaving it out uses the
// runtime's default locale, which differs between the Node.js server (SSR)
// and the browser (client), and causes React hydration mismatches ("server
// rendered text didn't match the client"). Pinning a fixed locale keeps
// every render identical regardless of where it runs. The same rule applies
// to `timeZone` below: always pass it explicitly, never rely on the
// runtime's default, for the same reason.

const LOCALE = "en-US";

export type DateFormatPattern = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

/**
 * Formats a *calendar* date — Invoice.invoiceDate, Project.startDate, and
 * every other Prisma `@db.Date` field — as `pattern` (the workspace's
 * dateFormat setting; see features/workspace-settings). `pattern` defaults to
 * the product default so a call site that genuinely has no workspace in
 * scope still renders something reasonable rather than throwing.
 *
 * Deliberately timezone-naive: a `@db.Date` column has no time-of-day, so
 * Postgres/Prisma round-trips it as UTC midnight with no "when during the
 * day" meaning attached. Reading it back through a non-UTC timezone would
 * shift the calendar day itself — a `Deal.expectedCloseDate` of Aug 20 could
 * render as Aug 19 for a workspace west of UTC. Always read the UTC
 * components directly. For real timestamps (a specific moment, not just a
 * day — Calendar events, `createdAt`/`updatedAt`) use formatDateTime instead,
 * which does convert to the workspace's timezone.
 */
export function formatDate(
  value: Date | string | null | undefined,
  // Plain `string`, not DateFormatPattern — Workspace.dateFormat is stored as
  // an unconstrained Prisma String (see prisma/schema.prisma), so callers
  // pass `user.workspaceDateFormat` straight through. Any value besides the
  // three known patterns falls through the switch's default below.
  pattern: string = "MM/DD/YYYY",
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  switch (pattern) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "MM/DD/YYYY":
    default:
      return `${month}/${day}/${year}`;
  }
}

/**
 * Formats a real timestamp (a specific instant — CalendarEvent.startAt/endAt,
 * createdAt/updatedAt) converted into `timeZone` (the workspace's timezone
 * setting), as `pattern` date + a 12-hour time. Unlike formatDate, this DOES
 * convert — a timestamp genuinely happened at a specific moment, and
 * displaying "3pm" for an event stored as 3pm UTC is only correct for a
 * workspace that's also in UTC.
 */
export function formatDateTime(
  value: Date | string | null | undefined,
  { pattern = "MM/DD/YYYY", timeZone = "UTC" }: { pattern?: string; timeZone?: string } = {},
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(LOCALE, {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  const time = date.toLocaleTimeString(LOCALE, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  let datePart: string;
  switch (pattern) {
    case "DD/MM/YYYY":
      datePart = `${parts.day}/${parts.month}/${parts.year}`;
      break;
    case "YYYY-MM-DD":
      datePart = `${parts.year}-${parts.month}-${parts.day}`;
      break;
    case "MM/DD/YYYY":
    default:
      datePart = `${parts.month}/${parts.day}/${parts.year}`;
  }
  return `${datePart}, ${time}`;
}

/** Just the time-of-day portion of formatDateTime, e.g. for a compact
 * calendar grid cell that already shows the date via its column/row. */
export function formatTime(
  value: Date | string | null | undefined,
  timeZone: string = "UTC",
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString(LOCALE, { timeZone, hour: "numeric", minute: "2-digit" });
}

export function formatMonthShort(value: Date): string {
  return value.toLocaleDateString(LOCALE, { month: "short" });
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(value);
}
