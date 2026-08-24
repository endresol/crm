"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { availabilityRulesSchema, meetingScheduleSchema } from "./schemas";
import {
  cancelMeeting,
  createSchedule,
  deleteSchedule,
  setAvailabilityRules,
  updateSchedule,
} from "./service";

export type ScheduleActionState = {
  error?: string;
};

export type RulesActionState = {
  error?: string;
  success?: boolean;
};

function parseScheduleForm(formData: FormData) {
  return meetingScheduleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    durationMinutes: formData.get("durationMinutes"),
    bufferMinutes: formData.get("bufferMinutes") || 0,
    minNoticeHours: formData.get("minNoticeHours") || 0,
    maxAdvanceDays: formData.get("maxAdvanceDays"),
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

export async function createScheduleAction(
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseScheduleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const schedule = await createSchedule(user.workspaceId, parsed.data);
  revalidatePath("/admin/meetings");
  redirect(`/admin/meetings/${schedule.id}`);
}

export async function updateScheduleAction(
  scheduleId: string,
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseScheduleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateSchedule(user.workspaceId, scheduleId, parsed.data);
  if (!updated) return { error: "That schedule no longer exists." };

  revalidatePath("/admin/meetings");
  revalidatePath(`/admin/meetings/${scheduleId}`);
  redirect(`/admin/meetings/${scheduleId}`);
}

export async function deleteScheduleAction(scheduleId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteSchedule(user.workspaceId, scheduleId);
  revalidatePath("/admin/meetings");
  redirect("/admin/meetings");
}

export async function setAvailabilityRulesAction(
  scheduleId: string,
  _prevState: RulesActionState,
  formData: FormData,
): Promise<RulesActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("rules") ?? "[]"));
  } catch {
    return { error: "Please check your availability and try again." };
  }

  const parsed = availabilityRulesSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your availability and try again." };
  }

  const result = await setAvailabilityRules(user.workspaceId, scheduleId, parsed.data);
  if (!result.ok) return { error: result.reason };

  revalidatePath(`/admin/meetings/${scheduleId}`);
  return { success: true };
}

export async function cancelMeetingAction(meetingId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await cancelMeeting(user.workspaceId, meetingId);
  revalidatePath("/admin/meetings");
}
