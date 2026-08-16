import "server-only";

import { prisma } from "@/lib/prisma";
import type { PriceBookInput, PriceBookEntryInput } from "./schemas";

export function listPriceBooks(workspaceId: string) {
  return prisma.priceBook.findMany({
    where: { workspaceId },
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getPriceBook(workspaceId: string, priceBookId: string) {
  return prisma.priceBook.findFirst({
    where: { id: priceBookId, workspaceId },
    include: {
      entries: {
        include: { product: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export function createPriceBook(workspaceId: string, input: PriceBookInput) {
  return prisma.priceBook.create({
    data: { workspaceId, ...input },
  });
}

export async function deletePriceBook(workspaceId: string, priceBookId: string) {
  const { count } = await prisma.priceBook.deleteMany({
    where: { id: priceBookId, workspaceId },
  });
  return count > 0;
}

/// Products not yet priced in this price book — feeds the "Add product pricing" select.
export async function listUnpricedProducts(workspaceId: string, priceBookId: string) {
  return prisma.product.findMany({
    where: { workspaceId, priceBookEntries: { none: { priceBookId } } },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
}

export async function addPriceBookEntry(
  workspaceId: string,
  priceBookId: string,
  input: PriceBookEntryInput,
) {
  const [priceBook, product] = await Promise.all([
    prisma.priceBook.findFirst({ where: { id: priceBookId, workspaceId } }),
    prisma.product.findFirst({ where: { id: input.productId, workspaceId } }),
  ]);
  if (!priceBook || !product) return null;

  try {
    return await prisma.priceBookEntry.create({
      data: {
        workspaceId,
        priceBookId,
        productId: input.productId,
        unitPrice: input.unitPrice,
        currency: input.currency,
      },
    });
  } catch {
    // Unique constraint on (priceBookId, productId) — already priced in this book.
    return null;
  }
}

export async function deletePriceBookEntry(workspaceId: string, entryId: string) {
  const { count } = await prisma.priceBookEntry.deleteMany({
    where: { id: entryId, workspaceId },
  });
  return count > 0;
}
