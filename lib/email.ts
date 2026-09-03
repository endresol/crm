import "server-only";

import { Resend } from "resend";

/**
 * Outbound transactional email (roadmap #21) — the first real outbound email
 * in this clone (everywhere else — Client Portal invites, Meeting
 * confirmations — was previously trimmed specifically for lacking this).
 * Backed by Resend: RESEND_API_KEY + EMAIL_FROM_ADDRESS in the environment
 * (see .env.example). One env-configured sender for every workspace — no
 * per-workspace custom sending domain/DNS verification, that's real SaaS
 * infrastructure out of scope for a clone.
 *
 * Never throws: every caller here is a mutation (a Server Action, or a
 * feature's actions.ts) that still needs to record what happened — an
 * EmailLog row either way — so failures come back as a normal `{ ok: false }`
 * result rather than an exception the caller would need to wrap in try/catch
 * on every call site. Same shape as lib/uploads.ts's UploadResult.
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  /** Plain text — converted to simple paragraph HTML here. Templates are
   * authored as plain text (same as DocumentTemplate.content), not raw HTML,
   * so there's no markup for a client's mail app to render unpredictably. */
  text: string;
  /** The sending User's own email — replies land in a real inbox even though
   * this clone has no inbound-reply monitoring (roadmap #21 trim). */
  replyTo?: string | null;
  fromName: string;
};

export type SendEmailResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; error: string };

function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS;
  if (!apiKey || !fromAddress) {
    return {
      ok: false,
      error: "Email sending isn't configured — set RESEND_API_KEY and EMAIL_FROM_ADDRESS.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: `${input.fromName} <${fromAddress}>`,
      to: input.to,
      subject: input.subject,
      html: textToHtml(input.text),
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, providerMessageId: data?.id ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Email failed to send." };
  }
}
