"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity, statusChangeAction } from "@/features/activity/service";
import { leadSchema } from "./schemas";
import { LEAD_STATUS_LABELS } from "./constants";
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

  const lead = await createLead(user.workspaceId, parsed.data);
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "LEAD",
    action: `created Lead ${lead.name}`,
    url: "/admin/leads",
    actorUserId: user.id,
    actorName: user.name,
  });
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

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "LEAD",
    action:
      statusChangeAction(
        updated.previousStatus,
        parsed.data.status,
        `Lead ${parsed.data.name}`,
        LEAD_STATUS_LABELS,
      ) ?? `updated Lead ${parsed.data.name}`,
    url: "/admin/leads",
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteLead(user.workspaceId, leadId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "LEAD",
      action: `deleted Lead ${deleted.name}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath("/admin/leads");
}

export async function convertLeadAction(leadId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await convertLeadToClient(user.workspaceId, leadId);
  if (!result) redirect("/admin/leads");

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "LEAD",
    action: `converted Lead ${result.leadName} to Client ${result.client.name}`,
    url: `/admin/clients/${result.client.id}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/leads");
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${result.client.id}`);
}
