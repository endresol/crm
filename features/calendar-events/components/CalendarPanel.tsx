"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import {
  WEEKDAY_LABELS,
  getMonthLabel,
  isSameDay,
  toDateKey,
  toDateTimeLocal,
} from "../dateGrid";
import { createCalendarEventAction, deleteCalendarEventAction, updateCalendarEventAction } from "../actions";
import { EventForm } from "./EventForm";
import styles from "./CalendarPanel.module.css";
import type { CalendarEvent } from "@/generated/prisma/client";

function defaultTimesFor(date: Date) {
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  const end = new Date(date);
  end.setHours(10, 0, 0, 0);
  return { startAt: toDateTimeLocal(start), endAt: toDateTimeLocal(end) };
}

export function CalendarPanel({
  year,
  month,
  cells,
  events,
  prevHref,
  nextHref,
  todayHref,
}: {
  year: number;
  month: number;
  cells: Date[];
  events: CalendarEvent[];
  prevHref: string;
  nextHref: string;
  todayHref: string;
}) {
  const [editing, setEditing] = useState<CalendarEvent | { date: Date } | null>(null);
  const today = new Date();

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = toDateKey(new Date(event.startAt));
    const list = eventsByDay.get(key) ?? [];
    list.push(event);
    eventsByDay.set(key, list);
  }

  const isNewEvent = (value: typeof editing): value is { date: Date } =>
    value !== null && !("id" in value);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.nav}>
          <Link href={prevHref} className={styles.navButton} aria-label="Previous month">
            ‹
          </Link>
          <div className={styles.monthLabel}>{getMonthLabel(year, month)}</div>
          <Link href={nextHref} className={styles.navButton} aria-label="Next month">
            ›
          </Link>
          <Link href={todayHref} className={styles.todayLink}>
            Today
          </Link>
        </div>
        <Button onClick={() => setEditing({ date: new Date() })}>
          <PlusIcon width={16} height={16} />
          Add event
        </Button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className={styles.weekdayLabel}>
            {label}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((date) => {
          const dayEvents = eventsByDay.get(toDateKey(date)) ?? [];
          const inMonth = date.getMonth() === month;
          const isToday = isSameDay(date, today);
          return (
            <div
              key={date.toISOString()}
              className={[
                styles.cell,
                inMonth ? "" : styles.cellOutside,
                isToday ? styles.cellToday : "",
              ].join(" ")}
            >
              <div className={styles.cellHeader}>
                <span className={[styles.dayNumber, isToday ? styles.dayNumberToday : ""].join(" ")}>
                  {date.getDate()}
                </span>
                <button
                  type="button"
                  className={styles.addButton}
                  aria-label="Add event"
                  onClick={() => setEditing({ date })}
                >
                  <PlusIcon width={12} height={12} />
                </button>
              </div>
              <div className={styles.events}>
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={styles.eventChip}
                    onClick={() => setEditing(event)}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={isNewEvent(editing) ? "Add event" : "Edit event"}
      >
        {isNewEvent(editing) ? (
          <EventForm
            action={createCalendarEventAction}
            defaultValues={{ title: "", ...defaultTimesFor(editing.date) }}
            submitLabel="Save"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <EventForm
            action={updateCalendarEventAction.bind(null, editing.id)}
            defaultValues={{
              title: editing.title,
              startAt: toDateTimeLocal(new Date(editing.startAt)),
              endAt: toDateTimeLocal(new Date(editing.endAt)),
            }}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteCalendarEventAction(editing.id);
                  setEditing(null);
                }}
              >
                <Button type="submit" variant="danger" size="sm">
                  Delete
                </Button>
              </form>
            }
          />
        ) : null}
      </Drawer>
    </div>
  );
}
