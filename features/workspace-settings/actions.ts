"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { workspaceSettingsSchema } from "./schemas";
import { updateWorkspaceSettings } from "./service";

export type WorkspaceSettingsActionState = {
  error?: string;
  success?: boolean;
};

export async function updateWorkspaceSettingsAction(
  _prevState: WorkspaceSettingsActionState,
  formData: FormData,
): Promise<WorkspaceSettingsActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = workspaceSettingsSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
    currency: formData.get("currency"),
    dateFormat: formData.get("dateFormat"),
    backgroundColor: formData.get("backgroundColor"),
    accentColor: formData.get("accentColor"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await updateWorkspaceSettings(user.workspaceId, parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}
