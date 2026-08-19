"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { uploadImage } from "@/lib/uploads";
import { workspaceSettingsSchema } from "./schemas";
import { setWorkspaceLogo, updateWorkspaceSettings } from "./service";

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

export async function uploadWorkspaceLogoAction(
  _prevState: WorkspaceSettingsActionState,
  formData: FormData,
): Promise<WorkspaceSettingsActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const uploaded = await uploadImage(file, `logos/${user.workspaceId}`);
  if ("error" in uploaded) return { error: uploaded.error };

  const result = await setWorkspaceLogo(user.workspaceId, uploaded.url);
  if (!result.ok) return { error: result.reason };

  // The logo renders in the sidebar on every admin page, not just this one.
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function removeWorkspaceLogoAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setWorkspaceLogo(user.workspaceId, null);
  revalidatePath("/admin", "layout");
}
