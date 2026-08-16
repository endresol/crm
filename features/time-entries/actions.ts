"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { timeEntrySchema } from "./schemas";
import { createTimeEntry, deleteTimeEntry } from "./service";

export type TimeEntryActionState = {
  error?: string;
  success?: boolean;
};

export async function logTimeAction(
  _prevState: TimeEntryActionState,
  formData: FormData,
): Promise<TimeEntryActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = timeEntrySchema.safeParse({
    clientId: formData.get("clientId"),
    date: formData.get("date"),
    hours: formData.get("hours"),
    minutes: formData.get("minutes"),
    description: formData.get("description"),
    billable: formData.get("billable") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createTimeEntry(user.workspaceId, user.id, parsed.data);

  revalidatePath("/admin/time-tracking");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  return { success: true };
}

export async function deleteTimeEntryAction(entryId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteTimeEntry(user.workspaceId, entryId);

  revalidatePath("/admin/time-tracking");
  revalidatePath(`/admin/clients/${clientId}`);
}
