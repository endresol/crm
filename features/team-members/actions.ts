"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { roleUpdateSchema, teamMemberSchema } from "./schemas";
import { createTeamMember, deleteTeamMember, emailTaken, updateTeamMemberRole } from "./service";

export type TeamMemberActionState = {
  error?: string;
  success?: boolean;
};

export async function createTeamMemberAction(
  _prevState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = teamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "MEMBER",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  if (await emailTaken(parsed.data.email)) {
    return { error: "An account with that email already exists." };
  }

  await createTeamMember(user.workspaceId, parsed.data);
  revalidatePath("/admin/team");
  return { success: true };
}

export async function updateTeamMemberRoleAction(
  memberId: string,
  role: string,
): Promise<TeamMemberActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = roleUpdateSchema.safeParse({ role });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please pick a valid role." };
  }

  const result = await updateTeamMemberRole(user.workspaceId, memberId, parsed.data.role);
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/admin/team");
  return { success: true };
}

export async function deleteTeamMemberAction(memberId: string): Promise<TeamMemberActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (memberId === user.id) {
    return { error: "You can't remove yourself while signed in." };
  }

  const result = await deleteTeamMember(user.workspaceId, memberId);
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/admin/team");
  return { success: true };
}
