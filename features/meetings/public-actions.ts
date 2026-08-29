"use server";

import { recordActivity } from "@/features/activity/service";
import { bookingSchema } from "./schemas";
import { bookMeeting, getAvailableSlots } from "./service";

// No auth in this file — availability isn't sensitive (a public Calendly
// page shows it to anyone with the link too), and both the Client Portal's
// booking flow and the public /book/[slug] embed need the same read. Actual
// booking is still write-scoped per caller: the portal calls bookMeeting
// with the logged-in Contact's clientId/contactId (features/meetings/
// portal-actions.ts); this file's bookMeetingPublicAction always passes none.
// Neither read nor write here caches/revalidates anything — slot
// availability is fetched fresh on every call already (no static rendering
// of a booking page would make sense), so there's nothing stale to bust.

export async function getAvailableSlotsAction(scheduleId: string): Promise<{ slots: string[] }> {
  const slots = await getAvailableSlots(scheduleId);
  return { slots: slots.map((s) => s.toISOString()) };
}

export type PublicBookingActionState = {
  error?: string;
  success?: boolean;
};

export async function bookMeetingPublicAction(
  scheduleId: string,
  _prevState: PublicBookingActionState,
  formData: FormData,
): Promise<PublicBookingActionState> {
  const parsed = bookingSchema.safeParse({
    bookerName: formData.get("bookerName"),
    bookerEmail: formData.get("bookerEmail"),
    startAt: formData.get("startAt"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const result = await bookMeeting(scheduleId, parsed.data);
  if (!result.ok) return { error: result.reason };

  await recordActivity({
    workspaceId: result.meeting.workspaceId,
    entityType: "MEETING",
    action: `booked Meeting with ${result.meeting.bookerName} (${result.meeting.scheduleName})`,
    url: result.meeting.meetingScheduleId ? `/admin/meetings/${result.meeting.meetingScheduleId}` : null,
    actorName: `${result.meeting.bookerName} (guest)`,
  });

  return { success: true };
}
