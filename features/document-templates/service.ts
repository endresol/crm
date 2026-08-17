import "server-only";

import { prisma } from "@/lib/prisma";
import type { DocumentTemplateInput } from "./schemas";
import type { DocumentTemplateTypeValue } from "./constants";

export function listTemplates(workspaceId: string) {
  return prisma.documentTemplate.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export function listTemplatesByType(workspaceId: string, type: DocumentTemplateTypeValue) {
  return prisma.documentTemplate.findMany({
    where: { workspaceId, type },
    orderBy: { createdAt: "desc" },
  });
}

export function getTemplate(workspaceId: string, templateId: string) {
  return prisma.documentTemplate.findFirst({ where: { id: templateId, workspaceId } });
}

export function createTemplate(workspaceId: string, input: DocumentTemplateInput) {
  return prisma.documentTemplate.create({
    data: { workspaceId, ...input },
  });
}

export async function updateTemplate(
  workspaceId: string,
  templateId: string,
  input: DocumentTemplateInput,
) {
  const { count } = await prisma.documentTemplate.updateMany({
    where: { id: templateId, workspaceId },
    data: input,
  });
  return count > 0;
}

export async function deleteTemplate(workspaceId: string, templateId: string) {
  const { count } = await prisma.documentTemplate.deleteMany({
    where: { id: templateId, workspaceId },
  });
  return count > 0;
}
