import "server-only";

import { prisma } from "@/lib/prisma";
import type { DiscountInput } from "./schemas";

export function listDiscounts(workspaceId: string) {
  return prisma.discount.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export function createDiscount(workspaceId: string, input: DiscountInput) {
  return prisma.discount.create({
    data: { workspaceId, ...input },
  });
}

export async function deleteDiscount(workspaceId: string, discountId: string) {
  const { count } = await prisma.discount.deleteMany({
    where: { id: discountId, workspaceId },
  });
  return count > 0;
}
