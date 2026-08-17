"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { sopSchema } from "./schemas";
import { createSop, deleteSop, updateSop } from "./service";

export type SopActionState = {
  error?: string;
  success?: boolean;
};

export async function createSopAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sop = await createSop(user.workspaceId);
  revalidatePath("/admin/sops");
  redirect(`/admin/sops/${sop.id}`);
}

export async function updateSopAction(
  sopId: string,
  _prevState: SopActionState,
  formData: FormData,
): Promise<SopActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = sopSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateSop(user.workspaceId, sopId, parsed.data);
  if (!updated) {
    return { error: "That SOP no longer exists." };
  }

  revalidatePath("/admin/sops");
  revalidatePath(`/admin/sops/${sopId}`);
  return { success: true };
}

export async function deleteSopAction(sopId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteSop(user.workspaceId, sopId);
  revalidatePath("/admin/sops");
  redirect("/admin/sops");
}
