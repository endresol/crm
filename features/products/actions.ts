"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { productSchema } from "./schemas";
import { createProduct, deleteProduct, updateProduct } from "./service";

export type ProductActionState = {
  error?: string;
  success?: boolean;
};

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    family: formData.get("family"),
    type: formData.get("type") || "PRODUCT",
    unit: formData.get("unit") || "EACH",
    description: formData.get("description"),
    active: formData.get("active") === "on",
  });
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createProduct(user.workspaceId, parsed.data);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateProduct(user.workspaceId, productId, parsed.data);
  if (!updated) {
    return { error: "That product no longer exists." };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteProduct(user.workspaceId, productId);
  revalidatePath("/admin/products");
}
