"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { getTask } from "@/features/tasks/service";
import { pomodoroTimerSchema } from "./schemas";
import { advanceTimerPhase, startTimer, stopTimer } from "./service";

export type PomodoroActionState = {
  error?: string;
  success?: boolean;
};

/** Every Pomodoro mutation touches the Sidebar's timer widget, which lives
 * in the shared /admin layout rather than any one page — "layout" busts it
 * everywhere regardless of which of the three Log Time entry points (Client,
 * Project, or Time Tracking itself) the action was called from. The
 * client/project-specific paths are still revalidated too, since a
 * completed WORK phase writes a real TimeEntry those pages display. */
function revalidateAfterPomodoroChange(clientId?: string | null, projectId?: string | null) {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/time-tracking");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
  if (projectId) revalidatePath(`/admin/projects/${projectId}`);
}

export async function startTimerAction(
  _prevState: PomodoroActionState,
  formData: FormData,
): Promise<PomodoroActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = pomodoroTimerSchema.safeParse({
    clientId: formData.get("clientId"),
    // `?? ""` — see the same fix in ./actions.ts's logTimeAction.
    projectId: formData.get("projectId") ?? "",
    taskId: formData.get("taskId") ?? "",
    description: formData.get("description"),
    billable: formData.get("billable") === "on",
    workMinutes: formData.get("workMinutes") || 25,
    shortBreakMinutes: formData.get("shortBreakMinutes") || 5,
    longBreakMinutes: formData.get("longBreakMinutes") || 20,
    cyclesBeforeLongBreak: formData.get("cyclesBeforeLongBreak") || 4,
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

  const result = await startTimer(user.workspaceId, user.id, parsed.data);
  if (!result.ok) return { error: result.reason };

  revalidateAfterPomodoroChange(parsed.data.clientId, parsed.data.projectId);
  return { success: true };
}

export async function advanceTimerPhaseAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const timer = await advanceTimerPhase(user.workspaceId, user.id);
  revalidateAfterPomodoroChange(timer?.clientId, timer?.projectId);
}

export async function stopTimerAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stopped = await stopTimer(user.workspaceId, user.id);
  revalidateAfterPomodoroChange(stopped?.clientId, stopped?.projectId);
}
