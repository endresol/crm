// Pure — no imports, same reasoning as mergeFields.ts. Fallback subject/body
// for the three automatically-sent EmailTemplateTypes (see the schema
// comment) when a workspace hasn't created its own template of that type yet
// — this codebase has no "seed default rows on workspace creation" step
// (features/auth/service.ts's signUp creates a bare Workspace, nothing else),
// so rather than invent one just for this feature, the default lives here in
// code and getEffectiveAutoTemplate (service.ts) prefers a workspace's own
// EmailTemplate row over it when one exists. The three manual-send types
// (INVOICE_SENT etc.) have no entry here — a human picks a template
// (SendEmailButton), so there's nothing to fall back to.

import type { EmailTemplateTypeValue } from "./constants";

export const DEFAULT_AUTO_EMAIL_TEMPLATES: Partial<
  Record<EmailTemplateTypeValue, { subject: string; body: string }>
> = {
  MEETING_CONFIRMATION: {
    subject: "Your meeting is confirmed — {{meeting.scheduleName}}",
    body: `Hi {{meeting.bookerName}},

Your meeting "{{meeting.scheduleName}}" with {{workspace.name}} is confirmed for {{meeting.time}}.

Manage or cancel this booking: {{meeting.url}}

See you then!`,
  },
  MEETING_CANCELLED: {
    subject: "Your meeting has been cancelled — {{meeting.scheduleName}}",
    body: `Hi {{meeting.bookerName}},

Your meeting "{{meeting.scheduleName}}" with {{workspace.name}}, previously scheduled for {{meeting.time}}, has been cancelled.

Book a new time: {{meeting.url}}`,
  },
  PORTAL_INVITE: {
    subject: "Your Client Portal access is ready — {{workspace.name}}",
    body: `Hi {{contact.name}},

{{workspace.name}} has set up your Client Portal access. Log in here: {{portal.loginUrl}}

If you don't have your password yet, reach out to your contact at {{workspace.name}}.`,
  },
};
