"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { uploadImage } from "@/lib/uploads";
import { passwordChangeSchema, profileSchema } from "./schemas";
import { changePassword, setAvatar, updateProfile } from "./service";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const result = await updateProfile(user.workspaceId, user.id, parsed.data);
  if (!result.ok) return { error: result.reason };

  // The sidebar renders the name/avatar from the session on every admin page,
  // so the whole admin subtree is stale after this — not just /admin/profile.
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const result = await changePassword(user.id, parsed.data);
  if (!result.ok) return { error: result.reason };

  return { success: true };
}

export async function uploadAvatarAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const uploaded = await uploadImage(file, `avatars/${user.id}`);
  if ("error" in uploaded) return { error: uploaded.error };

  const result = await setAvatar(user.workspaceId, user.id, uploaded.url);
  if (!result.ok) return { error: result.reason };

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function removeAvatarAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setAvatar(user.workspaceId, user.id, null);
  revalidatePath("/admin", "layout");
}
