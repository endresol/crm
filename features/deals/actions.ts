"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity, statusChangeAction } from "@/features/activity/service";
import { dealSchema } from "./schemas";
import { DEAL_STAGE_LABELS } from "./constants";
import { createDeal, deleteDeal, updateDeal } from "./service";

export type DealActionState = {
  error?: string;
  success?: boolean;
};

function parseDealForm(formData: FormData) {
  return dealSchema.safeParse({
    clientId: formData.get("clientId"),
    contactId: formData.get("contactId"),
    name: formData.get("name"),
    description: formData.get("description"),
    amount: formData.get("amount") || 0,
    currency: formData.get("currency"),
    stage: formData.get("stage") || "PROSPECTING",
    priority: formData.get("priority") || "MEDIUM",
    expectedCloseDate: formData.get("expectedCloseDate"),
    nextStep: formData.get("nextStep"),
  });
}

export async function createDealAction(
  _prevState: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseDealForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const deal = await createDeal(user.workspaceId, parsed.data);
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "DEAL",
    action: `created Deal ${deal.name}`,
    url: "/admin/deals",
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/deals");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  return { success: true };
}

export async function updateDealAction(
  dealId: string,
  _prevState: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseDealForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateDeal(user.workspaceId, dealId, parsed.data);
  if (!updated) {
    return { error: "That deal no longer exists." };
  }

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "DEAL",
    action:
      statusChangeAction(
        updated.previousStage,
        parsed.data.stage,
        `Deal ${parsed.data.name}`,
        DEAL_STAGE_LABELS,
        { verb: "moved", preposition: "to" },
      ) ?? `updated Deal ${parsed.data.name}`,
    url: "/admin/deals",
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/deals");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  return { success: true };
}

export async function deleteDealAction(dealId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteDeal(user.workspaceId, dealId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "DEAL",
      action: `deleted Deal ${deleted.name}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath("/admin/deals");
  revalidatePath(`/admin/clients/${clientId}`);
}
