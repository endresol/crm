"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { calendarEventSchema } from "./schemas";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "./service";

export type CalendarEventActionState = {
  error?: string;
  success?: boolean;
};

function parseEventForm(formData: FormData) {
  return calendarEventSchema.safeParse({
    title: formData.get("title"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
}

export async function createCalendarEventAction(
  _prevState: CalendarEventActionState,
  formData: FormData,
): Promise<CalendarEventActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createCalendarEvent(user.workspaceId, user.id, parsed.data);
  revalidatePath("/admin/calendar");
  return { success: true };
}

export async function updateCalendarEventAction(
  eventId: string,
  _prevState: CalendarEventActionState,
  formData: FormData,
): Promise<CalendarEventActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateCalendarEvent(user.workspaceId, eventId, parsed.data);
  if (!updated) {
    return { error: "That event no longer exists." };
  }

  revalidatePath("/admin/calendar");
  return { success: true };
}

export async function deleteCalendarEventAction(eventId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteCalendarEvent(user.workspaceId, eventId);
  revalidatePath("/admin/calendar");
}
