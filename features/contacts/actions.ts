"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { contactSchema } from "./schemas";
import { createContact, deleteContact, updateContact } from "./service";

export type ContactActionState = {
  error?: string;
};

function parseContactForm(formData: FormData) {
  return contactSchema.safeParse({
    clientId: formData.get("clientId"),
    fullName: formData.get("fullName"),
    jobTitle: formData.get("jobTitle"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
}

export async function createContactAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const contact = await createContact(user.workspaceId, parsed.data);
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/contacts/${contact.id}`);
}

export async function updateContactAction(
  contactId: string,
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateContact(user.workspaceId, contactId, parsed.data);
  if (!updated) {
    return { error: "That contact no longer exists." };
  }

  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${contactId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/contacts/${contactId}`);
}

export async function deleteContactAction(contactId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteContact(user.workspaceId, contactId);
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/contacts");
}
