"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { proposalSchema, proposalLineItemSchema } from "./schemas";
import {
  addLineItem,
  createProposal,
  deleteProposal,
  deleteLineItem,
  updateProposal,
  updateLineItem,
} from "./service";

export type ProposalActionState = {
  error?: string;
};

export type ProposalLineItemActionState = {
  error?: string;
  success?: boolean;
};

function parseProposalForm(formData: FormData) {
  return proposalSchema.safeParse({
    clientId: formData.get("clientId"),
    contactId: formData.get("contactId"),
    // See the comment on this same line in features/invoices/actions.ts.
    templateId: formData.get("templateId") ?? "",
    name: formData.get("name"),
    status: formData.get("status") || "DRAFT",
    currency: formData.get("currency"),
    notes: formData.get("notes"),
  });
}

export async function createProposalAction(
  _prevState: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseProposalForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const proposal = await createProposal(user.workspaceId, parsed.data);
  revalidatePath("/admin/proposals");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/proposals/${proposal.id}`);
}

export async function updateProposalAction(
  proposalId: string,
  _prevState: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseProposalForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateProposal(user.workspaceId, proposalId, parsed.data);
  if (!updated) {
    return { error: "That proposal no longer exists." };
  }

  revalidatePath("/admin/proposals");
  revalidatePath(`/admin/proposals/${proposalId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/proposals/${proposalId}`);
}

export async function deleteProposalAction(proposalId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteProposal(user.workspaceId, proposalId);
  revalidatePath("/admin/proposals");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/proposals");
}

function parseLineItemForm(formData: FormData) {
  return proposalLineItemSchema.safeParse({
    productId: formData.get("productId"),
    description: formData.get("description"),
    quantity: formData.get("quantity") || 1,
    unitPrice: formData.get("unitPrice") || 0,
  });
}

export async function addLineItemAction(
  proposalId: string,
  _prevState: ProposalLineItemActionState,
  formData: FormData,
): Promise<ProposalLineItemActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseLineItemForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await addLineItem(user.workspaceId, proposalId, parsed.data);
  revalidatePath(`/admin/proposals/${proposalId}`);
  return { success: true };
}

export async function updateLineItemAction(
  lineItemId: string,
  proposalId: string,
  _prevState: ProposalLineItemActionState,
  formData: FormData,
): Promise<ProposalLineItemActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseLineItemForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateLineItem(user.workspaceId, lineItemId, parsed.data);
  if (!updated) {
    return { error: "That line item no longer exists." };
  }

  revalidatePath(`/admin/proposals/${proposalId}`);
  return { success: true };
}

export async function deleteLineItemAction(lineItemId: string, proposalId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteLineItem(user.workspaceId, lineItemId);
  revalidatePath(`/admin/proposals/${proposalId}`);
}
