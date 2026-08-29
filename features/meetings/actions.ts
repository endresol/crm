"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity } from "@/features/activity/service";
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
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "MEETING",
    action: `created Meeting type ${schedule.name}`,
    url: `/admin/meetings/${schedule.id}`,
    actorUserId: user.id,
    actorName: user.name,
  });
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

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "MEETING",
    action: `updated Meeting type ${parsed.data.name}`,
    url: `/admin/meetings/${scheduleId}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/meetings");
  revalidatePath(`/admin/meetings/${scheduleId}`);
  redirect(`/admin/meetings/${scheduleId}`);
}

export async function deleteScheduleAction(scheduleId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteSchedule(user.workspaceId, scheduleId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "MEETING",
      action: `deleted Meeting type ${deleted.name}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
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

  const meeting = await cancelMeeting(user.workspaceId, meetingId);
  if (meeting) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "MEETING",
      action: `cancelled Meeting with ${meeting.bookerName} (${meeting.scheduleName})`,
      url: meeting.meetingScheduleId ? `/admin/meetings/${meeting.meetingScheduleId}` : null,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath("/admin/meetings");
}
