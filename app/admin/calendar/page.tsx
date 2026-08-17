import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listEventsInRange } from "@/features/calendar-events/service";
import { getMonthGridCells } from "@/features/calendar-events/dateGrid";
import { Topbar } from "@/components/layout/Topbar";
import { CalendarPanel } from "@/features/calendar-events/components/CalendarPanel";
import styles from "@/components/layout/AdminShell.module.css";

function hrefFor(year: number, month: number) {
  // month is 0-indexed internally; URL uses 1-indexed for readability.
  return `/admin/calendar?year=${year}&month=${month + 1}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const today = new Date();
  const year = Number.isFinite(Number(params.year)) && params.year ? Number(params.year) : today.getFullYear();
  const monthParam = Number.isFinite(Number(params.month)) && params.month ? Number(params.month) : today.getMonth() + 1;
  const month = Math.min(Math.max(monthParam - 1, 0), 11);

  const cells = getMonthGridCells(year, month);
  const gridStart = cells[0]!;
  const gridEnd = new Date(cells[cells.length - 1]!);
  gridEnd.setDate(gridEnd.getDate() + 1);

  const events = await listEventsInRange(user.workspaceId, gridStart, gridEnd);

  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);

  return (
    <>
      <Topbar title="Calendar" subtitle="Manage your calendar events from here." />
      <div className={styles.content}>
        <CalendarPanel
          year={year}
          month={month}
          cells={cells}
          events={events}
          prevHref={hrefFor(prevDate.getFullYear(), prevDate.getMonth())}
          nextHref={hrefFor(nextDate.getFullYear(), nextDate.getMonth())}
          todayHref={hrefFor(today.getFullYear(), today.getMonth())}
        />
      </div>
    </>
  );
}
