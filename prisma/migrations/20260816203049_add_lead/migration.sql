-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'UNQUALIFIED', 'CONTACTED', 'QUALIFIED', 'CONVERTED');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "businessName" TEXT,
    "website" TEXT,
    "budget" DOUBLE PRECISION,
    "source" TEXT,
    "description" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "convertedClientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_workspaceId_idx" ON "leads"("workspaceId");

-- CreateIndex
CREATE INDEX "leads_convertedClientId_idx" ON "leads"("convertedClientId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
