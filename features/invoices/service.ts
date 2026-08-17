import "server-only";

import { prisma } from "@/lib/prisma";
import type { InvoiceInput, LineItemInput } from "./schemas";

const withRelations = {
  client: { select: { id: true, name: true } },
  contact: { select: { id: true, fullName: true } },
  lineItems: true,
} as const;

export function listInvoices(workspaceId: string) {
  return prisma.invoice.findMany({
    where: { workspaceId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function listInvoicesForClient(workspaceId: string, clientId: string) {
  return prisma.invoice.findMany({
    where: { workspaceId, clientId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function getInvoice(workspaceId: string, invoiceId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, workspaceId },
    include: {
      ...withRelations,
      template: { select: { id: true, name: true } },
      lineItems: { include: { product: { select: { id: true, name: true } } } },
    },
  });
}

function toData(input: InvoiceInput) {
  return {
    clientId: input.clientId,
    contactId: input.contactId ?? null,
    templateId: input.templateId ?? null,
    name: input.name,
    billingType: input.billingType,
    status: input.status,
    invoiceDate: new Date(input.invoiceDate),
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    currency: input.currency,
    notes: input.notes,
  };
}

export function createInvoice(workspaceId: string, input: InvoiceInput) {
  return prisma.invoice.create({
    data: { workspaceId, ...toData(input) },
  });
}

export async function updateInvoice(workspaceId: string, invoiceId: string, input: InvoiceInput) {
  const { count } = await prisma.invoice.updateMany({
    where: { id: invoiceId, workspaceId },
    data: toData(input),
  });
  return count > 0;
}

export async function deleteInvoice(workspaceId: string, invoiceId: string) {
  const { count } = await prisma.invoice.deleteMany({
    where: { id: invoiceId, workspaceId },
  });
  return count > 0;
}

export function addLineItem(workspaceId: string, invoiceId: string, input: LineItemInput) {
  return prisma.invoiceLineItem.create({
    data: { workspaceId, invoiceId, ...input, productId: input.productId ?? null },
  });
}

export async function updateLineItem(workspaceId: string, lineItemId: string, input: LineItemInput) {
  const { count } = await prisma.invoiceLineItem.updateMany({
    where: { id: lineItemId, workspaceId },
    data: { ...input, productId: input.productId ?? null },
  });
  return count > 0;
}

export async function deleteLineItem(workspaceId: string, lineItemId: string) {
  const { count } = await prisma.invoiceLineItem.deleteMany({
    where: { id: lineItemId, workspaceId },
  });
  return count > 0;
}
