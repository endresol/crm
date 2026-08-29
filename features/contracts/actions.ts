"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity, statusChangeAction } from "@/features/activity/service";
import { contractContentSchema, contractSchema } from "./schemas";
import { CONTRACT_STATUS_LABELS } from "./constants";
import { createContract, deleteContract, updateContract, updateContractContent } from "./service";

export type ContractActionState = {
  error?: string;
};

export type ContractContentActionState = {
  error?: string;
  success?: boolean;
};

function parseContractForm(formData: FormData) {
  return contractSchema.safeParse({
    clientId: formData.get("clientId"),
    contactId: formData.get("contactId"),
    dealId: formData.get("dealId"),
    // See the comment on this same line in features/invoices/actions.ts.
    templateId: formData.get("templateId") ?? "",
    name: formData.get("name"),
    status: formData.get("status") || "DRAFT",
    contractType: formData.get("contractType"),
    contractValue: formData.get("contractValue"),
    currency: formData.get("currency"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
}

export async function createContractAction(
  _prevState: ContractActionState,
  formData: FormData,
): Promise<ContractActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseContractForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const contract = await createContract(user.workspaceId, parsed.data);
  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "CONTRACT",
    action: `created Contract ${contract.name}`,
    url: `/admin/contracts/${contract.id}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/contracts/${contract.id}`);
}

export async function updateContractAction(
  contractId: string,
  _prevState: ContractActionState,
  formData: FormData,
): Promise<ContractActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseContractForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateContract(user.workspaceId, contractId, parsed.data);
  if (!updated) {
    return { error: "That contract no longer exists." };
  }

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType: "CONTRACT",
    action:
      statusChangeAction(
        updated.previousStatus,
        parsed.data.status,
        `Contract ${parsed.data.name}`,
        CONTRACT_STATUS_LABELS,
      ) ?? `updated Contract ${parsed.data.name}`,
    url: `/admin/contracts/${contractId}`,
    actorUserId: user.id,
    actorName: user.name,
  });
  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/contracts/${contractId}`);
}

export async function deleteContractAction(contractId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await deleteContract(user.workspaceId, contractId);
  if (deleted) {
    await recordActivity({
      workspaceId: user.workspaceId,
      entityType: "CONTRACT",
      action: `deleted Contract ${deleted.name}`,
      actorUserId: user.id,
      actorName: user.name,
    });
  }
  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/contracts");
}

export async function updateContractContentAction(
  contractId: string,
  _prevState: ContractContentActionState,
  formData: FormData,
): Promise<ContractContentActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = contractContentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateContractContent(user.workspaceId, contractId, parsed.data);
  if (!updated) {
    return { error: "That contract no longer exists." };
  }

  revalidatePath(`/admin/contracts/${contractId}`);
  return { success: true };
}
