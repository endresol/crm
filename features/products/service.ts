import "server-only";

import { prisma } from "@/lib/prisma";
import type { ProductInput } from "./schemas";

export function listProducts(workspaceId: string) {
  return prisma.product.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export function getProduct(workspaceId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, workspaceId },
  });
}

export function createProduct(workspaceId: string, input: ProductInput) {
  return prisma.product.create({
    data: { workspaceId, ...input },
  });
}

export async function updateProduct(workspaceId: string, productId: string, input: ProductInput) {
  const { count } = await prisma.product.updateMany({
    where: { id: productId, workspaceId },
    data: input,
  });
  return count > 0;
}

export async function deleteProduct(workspaceId: string, productId: string) {
  const { count } = await prisma.product.deleteMany({
    where: { id: productId, workspaceId },
  });
  return count > 0;
}
