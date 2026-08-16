"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { priceBookSchema, priceBookEntrySchema } from "./schemas";
import {
  createPriceBook,
  deletePriceBook,
  addPriceBookEntry,
  deletePriceBookEntry,
} from "./service";

export type PriceBookActionState = {
  error?: string;
};

export type PriceBookEntryActionState = {
  error?: string;
  success?: boolean;
};

export async function createPriceBookAction(
  _prevState: PriceBookActionState,
  formData: FormData,
): Promise<PriceBookActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = priceBookSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const priceBook = await createPriceBook(user.workspaceId, parsed.data);
  revalidatePath("/admin/products");
  redirect(`/admin/products/price-books/${priceBook.id}`);
}

export async function deletePriceBookAction(priceBookId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deletePriceBook(user.workspaceId, priceBookId);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function addPriceBookEntryAction(
  priceBookId: string,
  _prevState: PriceBookEntryActionState,
  formData: FormData,
): Promise<PriceBookEntryActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = priceBookEntrySchema.safeParse({
    productId: formData.get("productId"),
    unitPrice: formData.get("unitPrice"),
    currency: formData.get("currency"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const entry = await addPriceBookEntry(user.workspaceId, priceBookId, parsed.data);
  if (!entry) {
    return { error: "That product is already priced in this price book." };
  }

  revalidatePath(`/admin/products/price-books/${priceBookId}`);
  return { success: true };
}

export async function deletePriceBookEntryAction(entryId: string, priceBookId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deletePriceBookEntry(user.workspaceId, entryId);
  revalidatePath(`/admin/products/price-books/${priceBookId}`);
}
