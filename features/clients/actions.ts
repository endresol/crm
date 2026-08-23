"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { uploadImage } from "@/lib/uploads";
import { clientSchema } from "./schemas";
import { createClient, deleteClient, setClientLogo, updateClient } from "./service";

export type ClientActionState = {
  error?: string;
};

export type ClientLogoActionState = {
  error?: string;
  success?: boolean;
};

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get("name"),
    legalName: formData.get("legalName"),
    email: formData.get("email"),
    website: formData.get("website"),
    industry: formData.get("industry"),
  });
}

export async function createClientAction(
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const client = await createClient(user.workspaceId, parsed.data);
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${client.id}`);
}

export async function updateClientAction(
  clientId: string,
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateClient(user.workspaceId, clientId, parsed.data);
  if (!updated) {
    return { error: "That client no longer exists." };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteClient(user.workspaceId, clientId);
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function uploadClientLogoAction(
  clientId: string,
  _prevState: ClientLogoActionState,
  formData: FormData,
): Promise<ClientLogoActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const uploaded = await uploadImage(file, `client-logos/${clientId}`);
  if ("error" in uploaded) return { error: uploaded.error };

  const result = await setClientLogo(user.workspaceId, clientId, uploaded.url);
  if (!result.ok) return { error: result.reason };

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function removeClientLogoAction(clientId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await setClientLogo(user.workspaceId, clientId, null);
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}
