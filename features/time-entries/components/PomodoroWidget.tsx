"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { advanceTimerPhaseAction, stopTimerAction } from "../pomodoro-actions";
import styles from "./PomodoroWidget.module.css";

export type ActiveTimer = {
  phase: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  cycleNumber: number;
  cyclesBeforeLongBreak: number;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  phaseStartedAt: Date | string;
  client: { id: string; name: string };
  project: { id: string; name: string } | null;
  task: { id: string; title: string } | null;
};

const PHASE_LABEL: Record<ActiveTimer["phase"], string> = {
  WORK: "Focus session",
  SHORT_BREAK: "Short break",
  LONG_BREAK: "Long break",
};

const ADVANCE_LABEL: Record<ActiveTimer["phase"], string> = {
  WORK: "Start break",
  SHORT_BREAK: "Start next session",
  LONG_BREAK: "Start next session",
};

function plannedMinutesFor(timer: ActiveTimer): number {
  if (timer.phase === "WORK") return timer.workMinutes;
  if (timer.phase === "SHORT_BREAK") return timer.shortBreakMinutes;
  return timer.longBreakMinutes;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * The persistent Sidebar widget for the running Pomodoro session (see the
 * schema comment on PomodoroTimer) — mounted from the /admin layout so it's
 * visible from every admin page, not just wherever it was started. Ticks
 * purely client-side (re-deriving elapsed/remaining from `phaseStartedAt`
 * every second) and never auto-advances the phase on its own; it just keeps
 * counting past zero into "+overtime" until the person clicks Start
 * break/next session or Stop.
 */
export function PomodoroWidget({ timer }: { timer: ActiveTimer }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startedAt = new Date(timer.phaseStartedAt).getTime();
  const plannedSeconds = plannedMinutesFor(timer) * 60;
  const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remainingSeconds = plannedSeconds - elapsedSeconds;
  const isOver = remainingSeconds < 0;

  const context = [timer.client.name, timer.project?.name, timer.task?.title].filter(Boolean).join(" › ");

  return (
    <div className={styles.widget}>
      <div className={styles.phaseRow}>
        <span className={styles.phaseLabel}>{PHASE_LABEL[timer.phase]}</span>
        <span className={styles.cycleLabel}>
          {timer.cycleNumber}/{timer.cyclesBeforeLongBreak}
        </span>
      </div>

      <span className={[styles.clock, isOver ? styles.clockOver : ""].join(" ")}>
        {isOver ? "+" : ""}
        {formatClock(Math.abs(remainingSeconds))}
      </span>

      <span className={styles.context} title={context}>
        {context}
      </span>

      <div className={styles.actions}>
        <form action={advanceTimerPhaseAction}>
          <Button type="submit" size="sm">
            {ADVANCE_LABEL[timer.phase]}
          </Button>
        </form>
        <form action={stopTimerAction}>
          <Button type="submit" variant="secondary" size="sm">
            Stop
          </Button>
        </form>
      </div>
    </div>
  );
}
