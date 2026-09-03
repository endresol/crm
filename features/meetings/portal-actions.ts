"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { recordActivity } from "@/features/activity/service";
import { sendAutoTemplatedEmail } from "@/features/email-templates/service";
import { getRequestBaseUrl } from "@/lib/base-url";
import { formatDateTime } from "@/lib/format";
import { bookingSchema } from "./schemas";
import { bookMeeting, cancelMeetingForContact } from "./service";

export type PortalBookingActionState = {
  error?: string;
};

export async function bookMeetingPortalAction(
  scheduleId: string,
  _prevState: PortalBookingActionState,
  formData: FormData,
): Promise<PortalBookingActionState> {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const parsed = bookingSchema.safeParse({
    bookerName: formData.get("bookerName") || contact.fullName,
    bookerEmail: formData.get("bookerEmail") || contact.email,
    startAt: formData.get("startAt"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const result = await bookMeeting(scheduleId, parsed.data, {
    clientId: contact.clientId,
    contactId: contact.id,
  });
  if (!result.ok) return { error: result.reason };

  await recordActivity({
    workspaceId: result.meeting.workspaceId,
    entityType: "MEETING",
    action: `booked Meeting with ${result.meeting.bookerName} (${result.meeting.scheduleName})`,
    url: result.meeting.meetingScheduleId ? `/admin/meetings/${result.meeting.meetingScheduleId}` : null,
    actorName: `${contact.fullName} (Client)`,
  });

  const baseUrl = await getRequestBaseUrl();
  await sendAutoTemplatedEmail({
    workspaceId: result.meeting.workspaceId,
    type: "MEETING_CONFIRMATION",
    entityType: "MEETING",
    url: result.meeting.meetingScheduleId ? `/admin/meetings/${result.meeting.meetingScheduleId}` : null,
    to: result.meeting.bookerEmail,
    fromName: contact.workspaceName,
    mergeContext: {
      workspace: { name: contact.workspaceName },
      contact: { name: contact.fullName },
      meeting: {
        scheduleName: result.meeting.scheduleName,
        bookerName: result.meeting.bookerName,
        time: formatDateTime(result.meeting.startAt, {
          pattern: contact.workspaceDateFormat,
          timeZone: contact.workspaceTimezone,
        }),
        url: `${baseUrl}/portal/meetings`,
      },
    },
  });

  revalidatePath("/portal/meetings");
  redirect("/portal/meetings");
}

export async function cancelMeetingPortalAction(meetingId: string): Promise<void> {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const meeting = await cancelMeetingForContact(contact.id, meetingId);
  if (meeting) {
    await recordActivity({
      workspaceId: meeting.workspaceId,
      entityType: "MEETING",
      action: `cancelled Meeting with ${meeting.bookerName} (${meeting.scheduleName})`,
      url: meeting.meetingScheduleId ? `/admin/meetings/${meeting.meetingScheduleId}` : null,
      actorName: `${contact.fullName} (Client)`,
    });

    const baseUrl = await getRequestBaseUrl();
    await sendAutoTemplatedEmail({
      workspaceId: meeting.workspaceId,
      type: "MEETING_CANCELLED",
      entityType: "MEETING",
      url: meeting.meetingScheduleId ? `/admin/meetings/${meeting.meetingScheduleId}` : null,
      to: meeting.bookerEmail,
      fromName: contact.workspaceName,
      mergeContext: {
        workspace: { name: contact.workspaceName },
        contact: { name: contact.fullName },
        meeting: {
          scheduleName: meeting.scheduleName,
          bookerName: meeting.bookerName,
          time: formatDateTime(meeting.startAt, {
            pattern: contact.workspaceDateFormat,
            timeZone: contact.workspaceTimezone,
          }),
          url: `${baseUrl}/portal/meetings`,
        },
      },
    });
  }
  revalidatePath("/portal/meetings");
}
