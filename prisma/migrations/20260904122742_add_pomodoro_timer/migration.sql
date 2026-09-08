-- CreateEnum
CREATE TYPE "PomodoroPhase" AS ENUM ('WORK', 'SHORT_BREAK', 'LONG_BREAK');

-- CreateTable
CREATE TABLE "pomodoro_timers" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "taskId" TEXT,
    "description" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "workMinutes" INTEGER NOT NULL DEFAULT 25,
    "shortBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "longBreakMinutes" INTEGER NOT NULL DEFAULT 20,
    "cyclesBeforeLongBreak" INTEGER NOT NULL DEFAULT 4,
    "phase" "PomodoroPhase" NOT NULL DEFAULT 'WORK',
    "cycleNumber" INTEGER NOT NULL DEFAULT 1,
    "phaseStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pomodoro_timers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pomodoro_timers_userId_key" ON "pomodoro_timers"("userId");

-- CreateIndex
CREATE INDEX "pomodoro_timers_workspaceId_idx" ON "pomodoro_timers"("workspaceId");

-- AddForeignKey
ALTER TABLE "pomodoro_timers" ADD CONSTRAINT "pomodoro_timers_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_timers" ADD CONSTRAINT "pomodoro_timers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_timers" ADD CONSTRAINT "pomodoro_timers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_timers" ADD CONSTRAINT "pomodoro_timers_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_timers" ADD CONSTRAINT "pomodoro_timers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
