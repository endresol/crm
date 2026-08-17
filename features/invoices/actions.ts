"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { invoiceSchema, lineItemSchema } from "./schemas";
import {
  addLineItem,
  createInvoice,
  deleteInvoice,
  deleteLineItem,
  updateInvoice,
  updateLineItem,
} from "./service";

export type InvoiceActionState = {
  error?: string;
};

export type LineItemActionState = {
  error?: string;
  success?: boolean;
};

function parseInvoiceForm(formData: FormData) {
  return invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    contactId: formData.get("contactId"),
    templateId: formData.get("templateId"),
    name: formData.get("name"),
    billingType: formData.get("billingType") || "ONE_TIME",
    status: formData.get("status") || "DRAFT",
    invoiceDate: formData.get("invoiceDate"),
    dueDate: formData.get("dueDate"),
    currency: formData.get("currency"),
    notes: formData.get("notes"),
  });
}

export async function createInvoiceAction(
  _prevState: InvoiceActionState,
  formData: FormData,
): Promise<InvoiceActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseInvoiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const invoice = await createInvoice(user.workspaceId, parsed.data);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function updateInvoiceAction(
  invoiceId: string,
  _prevState: InvoiceActionState,
  formData: FormData,
): Promise<InvoiceActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseInvoiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateInvoice(user.workspaceId, invoiceId, parsed.data);
  if (!updated) {
    return { error: "That invoice no longer exists." };
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/invoices/${invoiceId}`);
}

export async function deleteInvoiceAction(invoiceId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteInvoice(user.workspaceId, invoiceId);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/invoices");
}

function parseLineItemForm(formData: FormData) {
  return lineItemSchema.safeParse({
    productId: formData.get("productId"),
    description: formData.get("description"),
    quantity: formData.get("quantity") || 1,
    unitPrice: formData.get("unitPrice") || 0,
  });
}

export async function addLineItemAction(
  invoiceId: string,
  _prevState: LineItemActionState,
  formData: FormData,
): Promise<LineItemActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseLineItemForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await addLineItem(user.workspaceId, invoiceId, parsed.data);
  revalidatePath(`/admin/invoices/${invoiceId}`);
  return { success: true };
}

export async function updateLineItemAction(
  lineItemId: string,
  invoiceId: string,
  _prevState: LineItemActionState,
  formData: FormData,
): Promise<LineItemActionState> {
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

  revalidatePath(`/admin/invoices/${invoiceId}`);
  return { success: true };
}

export async function deleteLineItemAction(lineItemId: string, invoiceId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteLineItem(user.workspaceId, lineItemId);
  revalidatePath(`/admin/invoices/${invoiceId}`);
}
