"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity, statusChangeAction } from "@/features/activity/service";
import { projectSchema } from "./schemas";
import { PROJECT_STATUS_LABELS } from "./constants";
import { createProject, deleteProject, updateProject } from "./service";

export type ProjectActionState = {
  error?: string;
};

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status") || "PLANNING",
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
}

export async function createProjectAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const project = await createProject(user.workspaceId, parsed.data);
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "PROJECT",
    action: `created Project ${project.name}`,
    url: `/admin/projects/${project.id}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/projects/${project.id}`);
}

export async function updateProjectAction(
  projectId: string,
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateProject(user.workspaceId, projectId, parsed.data);
  if (!updated) {
    return { error: "That project no longer exists." };
  }

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "PROJECT",
    action:
      statusChangeAction(
        updated.previousStatus,
        parsed.data.status,
        `Project ${parsed.data.name}`,
        PROJECT_STATUS_LABELS,
      ) ?? `updated Project ${parsed.data.name}`,
    url: `/admin/projects/${projectId}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteProject(user.workspaceId, projectId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "PROJECT",
      action: `deleted Project ${deleted.name}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/projects");
}
