"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { milestoneSchema } from "./schemas";
import { createMilestone, deleteMilestone, updateMilestone } from "./service";

export type MilestoneActionState = {
  error?: string;
  success?: boolean;
};

function parseMilestoneForm(formData: FormData) {
  return milestoneSchema.safeParse({
    name: formData.get("name"),
    dueDate: formData.get("dueDate"),
  });
}

export async function createMilestoneAction(
  projectId: string,
  _prevState: MilestoneActionState,
  formData: FormData,
): Promise<MilestoneActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseMilestoneForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createMilestone(user.workspaceId, projectId, parsed.data);
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function updateMilestoneAction(
  milestoneId: string,
  projectId: string,
  _prevState: MilestoneActionState,
  formData: FormData,
): Promise<MilestoneActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseMilestoneForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateMilestone(user.workspaceId, milestoneId, parsed.data);
  if (!updated) {
    return { error: "That milestone no longer exists." };
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deleteMilestoneAction(milestoneId: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteMilestone(user.workspaceId, milestoneId);
  revalidatePath(`/admin/projects/${projectId}`);
}
