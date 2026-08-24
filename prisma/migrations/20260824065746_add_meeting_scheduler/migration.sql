-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "meeting_schedules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "minNoticeHours" INTEGER NOT NULL DEFAULT 4,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" TEXT NOT NULL,
    "meetingScheduleId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "meetingScheduleId" TEXT NOT NULL,
    "clientId" TEXT,
    "contactId" TEXT,
    "bookerName" TEXT NOT NULL,
    "bookerEmail" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_schedules_slug_key" ON "meeting_schedules"("slug");

-- CreateIndex
CREATE INDEX "meeting_schedules_workspaceId_idx" ON "meeting_schedules"("workspaceId");

-- CreateIndex
CREATE INDEX "availability_rules_meetingScheduleId_idx" ON "availability_rules"("meetingScheduleId");

-- CreateIndex
CREATE INDEX "meetings_workspaceId_idx" ON "meetings"("workspaceId");

-- CreateIndex
CREATE INDEX "meetings_meetingScheduleId_idx" ON "meetings"("meetingScheduleId");

-- CreateIndex
CREATE INDEX "meetings_clientId_idx" ON "meetings"("clientId");

-- CreateIndex
CREATE INDEX "meetings_contactId_idx" ON "meetings"("contactId");

-- AddForeignKey
ALTER TABLE "meeting_schedules" ADD CONSTRAINT "meeting_schedules_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_meetingScheduleId_fkey" FOREIGN KEY ("meetingScheduleId") REFERENCES "meeting_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_meetingScheduleId_fkey" FOREIGN KEY ("meetingScheduleId") REFERENCES "meeting_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

