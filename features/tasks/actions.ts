"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { taskSchema } from "./schemas";
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

  await createTask(user.workspaceId, projectId, parsed.data);
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

  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteTask(user.workspaceId, taskId);
  revalidatePath(`/admin/projects/${projectId}`);
}
