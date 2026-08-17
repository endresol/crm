import "server-only";

import { prisma } from "@/lib/prisma";
import type { LeadInput } from "./schemas";

export function listLeads(workspaceId: string) {
  return prisma.lead.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export function getLead(workspaceId: string, leadId: string) {
  return prisma.lead.findFirst({ where: { id: leadId, workspaceId } });
}

function toData(input: LeadInput) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    businessName: input.businessName,
    website: input.website,
    budget: input.budget ?? null,
    source: input.source,
    description: input.description,
    status: input.status,
  };
}

export function createLead(workspaceId: string, input: LeadInput) {
  return prisma.lead.create({
    data: { workspaceId, ...toData(input) },
  });
}

export async function updateLead(workspaceId: string, leadId: string, input: LeadInput) {
  const { count } = await prisma.lead.updateMany({
    where: { id: leadId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteLead(workspaceId: string, leadId: string) {
  const { count } = await prisma.lead.deleteMany({
    where: { id: leadId, workspaceId },
  });
  return count > 0;
}

/**
 * Converts a Lead into a Client + Contact (roadmap #8's "Convert to Client"
 * action). The Lead row is kept (not deleted) as conversion history, flipped
 * to CONVERTED and linked via convertedClientId. Field mapping is inferred —
 * see docs/feature-audit/05-leads.md's open questions.
 */
export async function convertLeadToClient(workspaceId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, workspaceId } });
  if (!lead) return null;

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        workspaceId,
        name: lead.businessName || lead.name,
        email: lead.email,
        website: lead.website,
      },
    });

    await tx.contact.create({
      data: {
        workspaceId,
        clientId: client.id,
        fullName: lead.name,
        email: lead.email,
        phone: lead.phone,
      },
    });

    await tx.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED", convertedClientId: client.id },
    });

    return client;
  });
}
