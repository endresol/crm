"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { uploadImage } from "@/lib/uploads";
import { recordActivity } from "@/features/activity/service";
import { sendAutoTemplatedEmail } from "@/features/email-templates/service";
import { getRequestBaseUrl } from "@/lib/base-url";
import { contactPortalPasswordSchema, contactSchema } from "./schemas";
import {
  createContact,
  deleteContact,
  setContactAvatar,
  setContactPortalPassword,
  updateContact,
} from "./service";

export type ContactActionState = {
  error?: string;
};

export type ContactAvatarActionState = {
  error?: string;
  success?: boolean;
};

export type ContactPortalActionState = {
  error?: string;
  success?: boolean;
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
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "CONTACT",
    action: `created Contact ${contact.fullName}`,
    url: `/admin/contacts/${contact.id}`,
    actorUserId: user.id,
    actorName: user.name,
  });
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

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "CONTACT",
    action: `updated Contact ${parsed.data.fullName}`,
    url: `/admin/contacts/${contactId}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${contactId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/contacts/${contactId}`);
}

export async function deleteContactAction(contactId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteContact(user.workspaceId, contactId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "CONTACT",
      action: `deleted Contact ${deleted.fullName}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/contacts");
}

export async function uploadContactAvatarAction(
  contactId: string,
  _prevState: ContactAvatarActionState,
  formData: FormData,
): Promise<ContactAvatarActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const uploaded = await uploadImage(file, `contact-avatars/${contactId}`);
  if ("error" in uploaded) return { error: uploaded.error };

  const result = await setContactAvatar(user.workspaceId, contactId, uploaded.url);
  if (!result.ok) return { error: result.reason };

  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${contactId}`);
  return { success: true };
}

export async function removeContactAvatarAction(contactId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setContactAvatar(user.workspaceId, contactId, null);
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${contactId}`);
}

function parsePortalPasswordForm(formData: FormData) {
  return contactPortalPasswordSchema.safeParse({ password: formData.get("password") });
}

export async function setPortalPasswordAction(
  contactId: string,
  _prevState: ContactPortalActionState,
  formData: FormData,
): Promise<ContactPortalActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parsePortalPasswordForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const result = await setContactPortalPassword(user.workspaceId, contactId, passwordHash);
  if (!result.ok) return { error: result.reason };

  // Deliberately no plaintext password in this email (see docs/roadmap.md) —
  // the admin still communicates it directly, same as before this feature;
  // this just tells the Contact where to log in once they have it.
  if (result.contact.email) {
    const baseUrl = await getRequestBaseUrl();
    await sendAutoTemplatedEmail({
      workspaceId: user.workspaceId,
      type: "PORTAL_INVITE",
      entityType: "CONTACT",
      url: `/admin/contacts/${contactId}`,
      to: result.contact.email,
      fromName: user.workspaceName,
      mergeContext: {
        workspace: { name: user.workspaceName },
        contact: { name: result.contact.fullName },
        portal: { loginUrl: `${baseUrl}/portal/login` },
      },
    });
  }

  revalidatePath(`/admin/contacts/${contactId}`);
  return { success: true };
}

export async function disablePortalAccessAction(contactId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setContactPortalPassword(user.workspaceId, contactId, null);
  revalidatePath(`/admin/contacts/${contactId}`);
}
