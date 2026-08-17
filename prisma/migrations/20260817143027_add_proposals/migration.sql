-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contactId" TEXT,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_line_items" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposals_workspaceId_idx" ON "proposals"("workspaceId");

-- CreateIndex
CREATE INDEX "proposals_clientId_idx" ON "proposals"("clientId");

-- CreateIndex
CREATE INDEX "proposals_contactId_idx" ON "proposals"("contactId");

-- CreateIndex
CREATE INDEX "proposals_templateId_idx" ON "proposals"("templateId");

-- CreateIndex
CREATE INDEX "proposal_line_items_workspaceId_idx" ON "proposal_line_items"("workspaceId");

-- CreateIndex
CREATE INDEX "proposal_line_items_proposalId_idx" ON "proposal_line_items"("proposalId");

-- CreateIndex
CREATE INDEX "proposal_line_items_productId_idx" ON "proposal_line_items"("productId");

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
