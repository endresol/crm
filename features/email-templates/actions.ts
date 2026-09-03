"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordActivity } from "@/features/activity/service";
import type { ActivityEntityTypeValue } from "@/features/activity/constants";
import { emailTemplateSchema, sendEmailSchema } from "./schemas";
import { createEmailTemplate, deleteEmailTemplate, sendTrackedEmail, updateEmailTemplate } from "./service";

export type EmailTemplateActionState = {
  error?: string;
  success?: boolean;
};

function parseTemplateForm(formData: FormData) {
  return emailTemplateSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
}

export async function createEmailTemplateAction(
  _prevState: EmailTemplateActionState,
  formData: FormData,
): Promise<EmailTemplateActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseTemplateForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await createEmailTemplate(user.workspaceId, parsed.data);
  revalidatePath("/admin/email-templates");
  return { success: true };
}

export async function updateEmailTemplateAction(
  templateId: string,
  _prevState: EmailTemplateActionState,
  formData: FormData,
): Promise<EmailTemplateActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseTemplateForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateEmailTemplate(user.workspaceId, templateId, parsed.data);
  if (!updated) {
    return { error: "That template no longer exists." };
  }

  revalidatePath("/admin/email-templates");
  return { success: true };
}

export async function deleteEmailTemplateAction(templateId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteEmailTemplate(user.workspaceId, templateId);
  revalidatePath("/admin/email-templates");
}

export type SendEmailActionState = {
  error?: string;
  success?: boolean;
};

/**
 * One shared "Send Email" action for every manual send entry point (Invoice/
 * Proposal/Contract/Questionnaire detail pages) — each page's own thin
 * wrapper (see e.g. features/invoices/actions.ts's sendInvoiceEmailAction)
 * binds `entityType`/`url`/`activityLabel` and hands off here, rather than
 * duplicating the validate → send → log → record-activity → revalidate
 * sequence at every call site. `activityLabel` is the entity-specific noun
 * phrase ("Invoice Website Retainer") the Activity feed sentence is built
 * from — see recordActivity's `action` doc comment for why that's a whole
 * predicate, not a verb/object pair the feed reassembles.
 */
export async function sendTemplatedEmailAction(
  entityType: ActivityEntityTypeValue,
  url: string | null,
  activityLabel: string,
  revalidatePaths: string[],
  _prevState: SendEmailActionState,
  formData: FormData,
): Promise<SendEmailActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = sendEmailSchema.safeParse({
    templateId: formData.get("templateId"),
    to: formData.get("to"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const result = await sendTrackedEmail({
    workspaceId: user.workspaceId,
    entityType,
    url,
    to: parsed.data.to,
    subject: parsed.data.subject,
    body: parsed.data.body,
    fromName: user.workspaceName,
    replyTo: user.email,
    sentByUserId: user.id,
  });

  if (!result.ok) {
    return { error: `Couldn't send that email: ${result.error}` };
  }

  await recordActivity({
    workspaceId: user.workspaceId,
    entityType,
    action: `emailed ${activityLabel} to ${parsed.data.to}`,
    url,
    actorUserId: user.id,
    actorName: user.name,
  });

  for (const path of revalidatePaths) revalidatePath(path);
  return { success: true };
}
