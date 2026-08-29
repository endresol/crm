"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity, statusChangeAction } from "@/features/activity/service";
import { taskSchema } from "./schemas";
import { TASK_STATUS_LABELS } from "./constants";
import { createTask, deleteTask, updateTask } from "./service";

export type TaskActionState = {
  error?: string;
  success?: boolean;
};

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "TODO",
    // `?? ""`: the Milestone <select> isn't rendered at all when the project
    // has no milestones yet (see TaskForm), so formData.get returns null
    // rather than "" — and the schema's optionalId only tolerates
    // undefined/"", not null. Same fix as the Template <select> comment in
    // features/invoices/actions.ts.
    milestoneId: formData.get("milestoneId") ?? "",
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });
}

export async function createTaskAction(
  projectId: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const task = await createTask(user.workspaceId, projectId, parsed.data);
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "TASK",
    action: `created Task ${task.title}`,
    url: `/admin/projects/${projectId}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function updateTaskAction(
  taskId: string,
  projectId: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateTask(user.workspaceId, taskId, parsed.data);
  if (!updated) {
    return { error: "That task no longer exists." };
  }

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "TASK",
    action:
      statusChangeAction(
        updated.previousStatus,
        parsed.data.status,
        `Task ${parsed.data.title}`,
        TASK_STATUS_LABELS,
      ) ?? `updated Task ${parsed.data.title}`,
    url: `/admin/projects/${projectId}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteTask(user.workspaceId, taskId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "TASK",
      action: `deleted Task ${deleted.title}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath(`/admin/projects/${projectId}`);
}
