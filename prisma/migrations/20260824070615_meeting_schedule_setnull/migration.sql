-- DropForeignKey
ALTER TABLE "meetings" DROP CONSTRAINT "meetings_meetingScheduleId_fkey";

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "scheduleName" TEXT NOT NULL,
ALTER COLUMN "meetingScheduleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_meetingScheduleId_fkey" FOREIGN KEY ("meetingScheduleId") REFERENCES "meeting_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

