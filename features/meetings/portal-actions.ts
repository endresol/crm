"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
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

  revalidatePath("/portal/meetings");
  redirect("/portal/meetings");
}

export async function cancelMeetingPortalAction(meetingId: string): Promise<void> {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  await cancelMeetingForContact(contact.id, meetingId);
  revalidatePath("/portal/meetings");
}
