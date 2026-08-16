"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { discountSchema } from "./schemas";
import { createDiscount, deleteDiscount } from "./service";

export type DiscountActionState = {
  error?: string;
  success?: boolean;
};

export async function createDiscountAction(
  _prevState: DiscountActionState,
  formData: FormData,
): Promise<DiscountActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = discountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") || "PERCENTAGE",
    value: formData.get("value"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createDiscount(user.workspaceId, parsed.data);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteDiscountAction(discountId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteDiscount(user.workspaceId, discountId);
  revalidatePath("/admin/products");
}
