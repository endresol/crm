-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('CLIENT', 'CONTACT', 'DEAL', 'LEAD', 'PROJECT', 'TASK', 'MILESTONE', 'INVOICE', 'PROPOSAL', 'CONTRACT', 'QUESTIONNAIRE', 'MEETING', 'TEAM_MEMBER', 'WORKSPACE');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityLabel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "url" TEXT,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_workspaceId_createdAt_idx" ON "activity_logs"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
