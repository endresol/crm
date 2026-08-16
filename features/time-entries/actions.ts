"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { timeEntrySchema } from "./schemas";
import { createTimeEntry, deleteTimeEntry } from "./service";
import { getProject } from "@/features/projects/service";
import { getTask } from "@/features/tasks/service";

export type TimeEntryActionState = {
  error?: string;
  success?: boolean;
};

export async function logTimeAction(
  _prevState: TimeEntryActionState,
  formData: FormData,
): Promise<TimeEntryActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = timeEntrySchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    date: formData.get("date"),
    hours: formData.get("hours"),
    minutes: formData.get("minutes"),
    description: formData.get("description"),
    billable: formData.get("billable") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  if (parsed.data.projectId) {
    const project = await getProject(user.workspaceId, parsed.data.projectId);
    if (!project || project.clientId !== parsed.data.clientId) {
      return { error: "Choose a project that belongs to the selected client." };
    }
  }

  if (parsed.data.taskId) {
    const task = await getTask(user.workspaceId, parsed.data.taskId);
    if (!task || task.projectId !== parsed.data.projectId) {
      return { error: "Choose a task that belongs to the selected project." };
    }
  }

  await createTimeEntry(user.workspaceId, user.id, parsed.data);

  revalidatePath("/admin/time-tracking");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  if (parsed.data.projectId) {
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  }
  return { success: true };
}

export async function deleteTimeEntryAction(entryId: string, clientId: string, projectId?: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteTimeEntry(user.workspaceId, entryId);

  revalidatePath("/admin/time-tracking");
  revalidatePath(`/admin/clients/${clientId}`);
  if (projectId) {
    revalidatePath(`/admin/projects/${projectId}`);
  }
}
