import { Fragment } from "react";
import { formatMonthShort } from "@/lib/format";
import { TASK_STATUS_COLORS } from "../constants";
import styles from "./GanttChart.module.css";
import type { Task } from "@/generated/prisma/client";

const DAY_WIDTH = 28;
const MAX_DAYS = 180;
const MS_PER_DAY = 86_400_000;

type DateLike = Date | string | null | undefined;

export type GanttTask = Pick<Task, "id" | "title" | "status" | "startDate" | "dueDate" | "milestoneId">;
export type GanttMilestone = { id: string; name: string };

function toDate(value: DateLike): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

export function GanttChart({
  tasks,
  milestones,
  projectStartDate,
  projectEndDate,
  onTaskClick,
}: {
  tasks: GanttTask[];
  milestones: GanttMilestone[];
  projectStartDate?: DateLike;
  projectEndDate?: DateLike;
  onTaskClick: (task: GanttTask) => void;
}) {
  const datedTasks = tasks.filter((task) => task.startDate || task.dueDate);
  const undatedCount = tasks.length - datedTasks.length;

  const allDates: Date[] = [];
  const projectStart = toDate(projectStartDate);
  const projectEnd = toDate(projectEndDate);
  if (projectStart) allDates.push(projectStart);
  if (projectEnd) allDates.push(projectEnd);
  for (const task of datedTasks) {
    const start = toDate(task.startDate) ?? toDate(task.dueDate)!;
    const end = toDate(task.dueDate) ?? toDate(task.startDate)!;
    allDates.push(start, end);
  }

  if (allDates.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
        Add a start or due date to a task to see it here.
      </p>
    );
  }

  let minDate = startOfDay(new Date(Math.min(...allDates.map((d) => d.getTime()))));
  let maxDate = startOfDay(new Date(Math.max(...allDates.map((d) => d.getTime()))));
  minDate = new Date(minDate.getTime() - MS_PER_DAY);
  maxDate = new Date(maxDate.getTime() + MS_PER_DAY);

  let totalDays = diffDays(minDate, maxDate) + 1;
  const clamped = totalDays > MAX_DAYS;
  if (clamped) totalDays = MAX_DAYS;

  // Group dated tasks by milestone (only milestones that actually have dated tasks show up).
  const groups: { key: string; label: string | null; tasks: GanttTask[] }[] = [];
  for (const milestone of milestones) {
    const groupTasks = datedTasks.filter((task) => task.milestoneId === milestone.id);
    if (groupTasks.length > 0) groups.push({ key: milestone.id, label: milestone.name, tasks: groupTasks });
  }
  const milestoneIds = new Set(milestones.map((m) => m.id));
  const ungrouped = datedTasks.filter((task) => !task.milestoneId || !milestoneIds.has(task.milestoneId));
  if (ungrouped.length > 0) {
    groups.push({ key: "none", label: groups.length > 0 ? "No milestone" : null, tasks: ungrouped });
  }

  // Build an explicit, deterministic row plan (header is row 1).
  type Row =
    | { type: "group"; row: number; label: string }
    | { type: "task"; row: number; task: GanttTask; offsetPct: number; widthPct: number };
  const rows: Row[] = [];
  let rowIndex = 2;
  for (const group of groups) {
    if (group.label) {
      rows.push({ type: "group", row: rowIndex, label: group.label });
      rowIndex += 1;
    }
    for (const task of group.tasks) {
      const start = toDate(task.startDate) ?? toDate(task.dueDate)!;
      const end = toDate(task.dueDate) ?? toDate(task.startDate)!;
      const offsetDays = Math.max(0, diffDays(minDate, start));
      const spanDays = Math.max(1, Math.min(diffDays(start, end) + 1, totalDays - offsetDays));
      rows.push({
        type: "task",
        row: rowIndex,
        task,
        offsetPct: (offsetDays / totalDays) * 100,
        widthPct: (spanDays / totalDays) * 100,
      });
      rowIndex += 1;
    }
  }
  const totalRows = rowIndex - 1;

  return (
    <div>
      {clamped && (
        <p className={styles.note}>Showing the first {MAX_DAYS} days — some dates fall outside this range.</p>
      )}
      {undatedCount > 0 && (
        <p className={styles.note}>
          {undatedCount} task{undatedCount === 1 ? "" : "s"} without dates aren&apos;t shown here.
        </p>
      )}
      <div className={styles.scrollWrap}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `220px repeat(${totalDays}, ${DAY_WIDTH}px)`,
            gridTemplateRows: `auto repeat(${totalRows - 1}, minmax(40px, auto))`,
          }}
        >
          <div className={styles.headerLabel} style={{ gridRow: 1, gridColumn: 1 }} />
          {Array.from({ length: totalDays }).map((_, i) => {
            const date = new Date(minDate.getTime() + i * MS_PER_DAY);
            const showMonth = i === 0 || date.getDate() === 1;
            return (
              <div key={i} className={styles.headerCell} style={{ gridRow: 1, gridColumn: i + 2 }}>
                {showMonth && (
                  <div className={styles.monthLabel}>{formatMonthShort(date)}</div>
                )}
                <div className={styles.dayLabel}>{date.getDate()}</div>
              </div>
            );
          })}

          {rows.map((row) =>
            row.type === "group" ? (
              <div
                key={`group-${row.row}`}
                className={styles.groupHeader}
                style={{ gridRow: row.row, gridColumn: `1 / span ${totalDays + 1}` }}
              >
                {row.label}
              </div>
            ) : (
              <Fragment key={row.task.id}>
                <div
                  className={styles.rowLabel}
                  style={{ gridRow: row.row, gridColumn: 1 }}
                  title={row.task.title}
                >
                  {row.task.title}
                </div>
                <div
                  className={styles.trackCell}
                  style={{
                    gridRow: row.row,
                    gridColumn: `2 / span ${totalDays}`,
                    ["--day-width" as string]: `${DAY_WIDTH}px`,
                  }}
                >
                  <button
                    type="button"
                    className={styles.bar}
                    style={{
                      left: `${row.offsetPct}%`,
                      width: `${row.widthPct}%`,
                      background: TASK_STATUS_COLORS[row.task.status as keyof typeof TASK_STATUS_COLORS],
                    }}
                    onClick={() => onTaskClick(row.task)}
                    title={row.task.title}
                  />
                </div>
              </Fragment>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
