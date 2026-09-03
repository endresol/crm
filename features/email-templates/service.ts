import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { substituteEmailMergeFields } from "./mergeFields";
import { DEFAULT_AUTO_EMAIL_TEMPLATES } from "./defaults";
import type { EmailTemplateInput } from "./schemas";
import type { EmailTemplateTypeValue } from "./constants";
import type { EmailMergeFieldContext } from "./mergeFields";
import type { ActivityEntityTypeValue } from "@/features/activity/constants";

export function listEmailTemplates(workspaceId: string) {
  return prisma.emailTemplate.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export function listEmailTemplatesByType(workspaceId: string, type: EmailTemplateTypeValue) {
  return prisma.emailTemplate.findMany({
    where: { workspaceId, type },
    orderBy: { createdAt: "desc" },
  });
}

export function getEmailTemplate(workspaceId: string, templateId: string) {
  return prisma.emailTemplate.findFirst({ where: { id: templateId, workspaceId } });
}

export function createEmailTemplate(workspaceId: string, input: EmailTemplateInput) {
  return prisma.emailTemplate.create({
    data: { workspaceId, ...input },
  });
}

export async function updateEmailTemplate(
  workspaceId: string,
  templateId: string,
  input: EmailTemplateInput,
) {
  const { count } = await prisma.emailTemplate.updateMany({
    where: { id: templateId, workspaceId },
    data: input,
  });
  return count > 0;
}

export async function deleteEmailTemplate(workspaceId: string, templateId: string) {
  const { count } = await prisma.emailTemplate.deleteMany({
    where: { id: templateId, workspaceId },
  });
  return count > 0;
}

export type SendTrackedEmailInput = {
  workspaceId: string;
  entityType: ActivityEntityTypeValue;
  /** Where the record this email is about links to (admin-side) — same
   * "nowhere sensible" nullability as RecordActivityInput.url. */
  url?: string | null;
  to: string;
  subject: string;
  body: string;
  fromName: string;
  replyTo?: string | null;
  sentByUserId?: string | null;
};

export type SendTrackedEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Sends one email (lib/email.ts) and always writes an EmailLog row — on
 * success *and* failure, so a misconfigured provider or a rejected send is
 * visible on the Email Log page rather than silently vanishing. Doesn't
 * write an ActivityLog row itself; the caller does that with its own
 * entity-specific wording ("emailed Invoice Website Retainer to
 * john@acme.com"), same as every other mutation in this codebase.
 */
export async function sendTrackedEmail(input: SendTrackedEmailInput): Promise<SendTrackedEmailResult> {
  const result = await sendEmail({
    to: input.to,
    subject: input.subject,
    text: input.body,
    fromName: input.fromName,
    replyTo: input.replyTo,
  });

  await prisma.emailLog.create({
    data: {
      workspaceId: input.workspaceId,
      entityType: input.entityType,
      url: input.url ?? null,
      contactEmail: input.to,
      subject: input.subject,
      body: input.body,
      status: result.ok ? "SENT" : "FAILED",
      errorMessage: result.ok ? null : result.error,
      providerMessageId: result.ok ? result.providerMessageId : null,
      sentByUserId: input.sentByUserId ?? null,
    },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** A workspace's own EmailTemplate of `type`, falling back to the built-in
 * default (defaults.ts) so MEETING_CONFIRMATION/MEETING_CANCELLED/
 * PORTAL_INVITE work before an admin has ever visited Email Templates. Only
 * meaningful for those three auto-sent types — see the schema comment. */
async function getEffectiveAutoTemplate(workspaceId: string, type: EmailTemplateTypeValue) {
  const custom = await prisma.emailTemplate.findFirst({
    where: { workspaceId, type },
    orderBy: { createdAt: "desc" },
  });
  if (custom) return { subject: custom.subject, body: custom.body };
  return DEFAULT_AUTO_EMAIL_TEMPLATES[type] ?? null;
}

export type SendAutoTemplatedEmailInput = {
  workspaceId: string;
  type: EmailTemplateTypeValue;
  entityType: ActivityEntityTypeValue;
  url?: string | null;
  to: string;
  fromName: string;
  mergeContext: EmailMergeFieldContext;
};

/**
 * The system-triggered counterpart to the "Send Email" button — used from
 * bookMeeting/cancelMeeting and setContactPortalPassword, where there's no
 * human picking a template on a click, just an event that should notify
 * someone. Never surfaces a failure to the caller as anything but a logged
 * EmailLog row: booking a meeting (or setting a portal password) should
 * still succeed even when the confirmation email doesn't send — same
 * "non-critical side effect, don't fail the mutation over it" reasoning as
 * lib/uploads.ts's deleteImage.
 */
export async function sendAutoTemplatedEmail(input: SendAutoTemplatedEmailInput): Promise<void> {
  const template = await getEffectiveAutoTemplate(input.workspaceId, input.type);
  if (!template) return;

  await sendTrackedEmail({
    workspaceId: input.workspaceId,
    entityType: input.entityType,
    url: input.url,
    to: input.to,
    subject: substituteEmailMergeFields(template.subject, input.mergeContext),
    body: substituteEmailMergeFields(template.body, input.mergeContext),
    fromName: input.fromName,
  });
}

export function listEmailLog(workspaceId: string, { take = 200 }: { take?: number } = {}) {
  return prisma.emailLog.findMany({
    where: { workspaceId },
    include: { sentByUser: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}
