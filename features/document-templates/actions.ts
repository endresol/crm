"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { documentTemplateSchema } from "./schemas";
import { createTemplate, deleteTemplate, updateTemplate } from "./service";

export type DocumentTemplateActionState = {
  error?: string;
  success?: boolean;
};

function parseTemplateForm(formData: FormData) {
  return documentTemplateSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    content: formData.get("content"),
  });
}

export async function createTemplateAction(
  _prevState: DocumentTemplateActionState,
  formData: FormData,
): Promise<DocumentTemplateActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseTemplateForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createTemplate(user.workspaceId, parsed.data);
  revalidatePath("/admin/templates");
  return { success: true };
}

export async function updateTemplateAction(
  templateId: string,
  _prevState: DocumentTemplateActionState,
  formData: FormData,
): Promise<DocumentTemplateActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseTemplateForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateTemplate(user.workspaceId, templateId, parsed.data);
  if (!updated) {
    return { error: "That template no longer exists." };
  }

  revalidatePath("/admin/templates");
  return { success: true };
}

export async function deleteTemplateAction(templateId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteTemplate(user.workspaceId, templateId);
  revalidatePath("/admin/templates");
}
