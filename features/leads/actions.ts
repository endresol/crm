"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { leadSchema } from "./schemas";
import { convertLeadToClient, createLead, deleteLead, updateLead } from "./service";

export type LeadActionState = {
  error?: string;
  success?: boolean;
};

function parseLeadForm(formData: FormData) {
  return leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    businessName: formData.get("businessName"),
    website: formData.get("website"),
    budget: formData.get("budget"),
    source: formData.get("source"),
    description: formData.get("description"),
    status: formData.get("status") || "NEW",
  });
}

export async function createLeadAction(
  _prevState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseLeadForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createLead(user.workspaceId, parsed.data);
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function updateLeadAction(
  leadId: string,
  _prevState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseLeadForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateLead(user.workspaceId, leadId, parsed.data);
  if (!updated) {
    return { error: "That lead no longer exists." };
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteLead(user.workspaceId, leadId);
  revalidatePath("/admin/leads");
}

export async function convertLeadAction(leadId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const client = await convertLeadToClient(user.workspaceId, leadId);
  if (!client) redirect("/admin/leads");

  revalidatePath("/admin/leads");
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${client.id}`);
}
