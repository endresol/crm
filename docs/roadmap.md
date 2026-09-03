# Feature backlog (Phase 4+)

Done — see git log / SPEC.md: Auth, Clients, Time Tracking (scoped to Client), **Contacts** (#1),
**Products & Pricing** (#2), **SOPs** (#3), **Calendar** (#4), **Team members & roles** (#5),
**Workspace settings** (#6), **Deals** (#7), **Leads** (#8), **Projects** (#9), **Tasks** (#10),
**Milestones** (#11), **Gantt chart view** (#12),
**Upgrade Time Tracking to log against Project/Task** (#13), **Document Templates system** (#14),
**Invoices** (#15), **Proposals** (#16), **Contracts** (#17), **Questionnaires** (#18),
**Client Portal** (#20), **Meeting Scheduler** (#19), **Activity log / notifications** (#23),
**Email Templates** (#21).

`DocumentTemplate` is a single shared model (type: PROPOSAL/CONTRACT/INVOICE/QUESTIONNAIRE) with
`{{merge.field}}` tokens (features/document-templates/mergeFields.ts) resolved against a Client/
Workspace when a document is generated — but each document type still gets its own content model
(line items for Invoice/Proposal, clause text for Contract, one question per QuestionnaireQuestion
row for Questionnaire), not one shared polymorphic table — their content shapes differ too much
for that to be a good idea. Questionnaire's "fill from template" is the one case that turns
`DocumentTemplate.content` into rows rather than copying it as-is: one line of content becomes one
QuestionnaireQuestion (see features/questionnaires/service.ts). See the merge-field template
system and content models discussion in chat around 2026-08-17 if picking this back up.

Client Portal (#20) is a Contact-principal login (its own session/cookie — see the doc comments
on Contact.portalPasswordHash and PortalSession) with a dashboard, read-only Projects, and a
Questionnaires flow a Contact can actually answer and submit — the first real client-facing
surface, closing the loop the Questionnaire trim above flagged. Trimmed from the full audit
(docs/feature-audit/14-client-portal.md): no email invite (the admin sets a Contact's portal
password directly, from the Contact detail page — this clone has no outbound email), no
per-project visibility control (a Contact sees all of its Client's projects), no Requests/Meetings/
notices/iframes (Meetings needs #19 anyway), and no Invoice/Proposal/Contract visibility yet
(natural follow-up). Domain separation (client.<yourdomain> vs. the admin app) is env-var-gated in
proxy.ts (PORTAL_HOST) — unset in local dev/previews so it stays testable without DNS.

Meeting Scheduler (#19) is a Calendly-style booking system: MeetingSchedule (a bookable meeting
type, workspace-owned rather than per-staff-member — this app has no staff working-hours model to
hang per-user availability off of), AvailabilityRule (a flat recurring weekly schedule, in
Workspace.timezone), and Meeting (a booked instance, attributed to a Contact when booked from the
Client Portal or fully anonymous when booked from the public page). Built with two entry points
from day one, as asked: the Client Portal's "Request a meeting" (roadmap #20's Meetings page) and a
public, unauthenticated `/book/[slug]` page meant to be linked or `<iframe>`-embedded from the
agency's own external website — both share the same slot-computation service
(features/meetings/slots.ts) and booking form (BookingFlow), differing only in whether the booker
is an already-known Contact or a guest typing their own name/email. Slot math is real wall-clock
IANA timezone arithmetic (lib/timezone.ts), not a shortcut — a booking page showing the wrong time
is a client showing up to the wrong slot, not a cosmetic bug. Trimmed: no e-signature-style
confirmation email (no outbound email in this clone, same as everywhere else), no per-slot video
link, and no date-range availability overrides (only the flat weekly rule set).

While testing this, found and fixed a real bug in proxy.ts predating this feature: bouncing an
already-logged-in visitor away from /login (or /portal/login) based on cookie *presence* could
infinite-loop when the cookie was stale — e.g. an admin disabling a Contact's portal access (which
revokes their PortalSession rows) without also being able to clear that Contact's own browser
cookie. That bounce now lives in each login page itself, using the same authoritative
getCurrentUser()/getCurrentContact() check the page needed anyway — see proxy.ts's comment.

Activity log / notifications (#23) is a flat, workspace-wide `ActivityLog` audit trail
(features/activity) — one row per mutation, `action` holding the *entire* predicate ("moved Deal
Website Redesign to Closed Won") rather than a verb + object pair the UI reassembles, since a
status change's target only reads correctly sitting after the object (see the schema comment and
statusChangeAction). Wired into the CRM/Delivery/Money entities' create/update/delete actions
(status-aware where the entity has one: Deal, Lead, Project, Task, Invoice, Proposal, Contract,
Questionnaire) plus Team members, Workspace settings, and both Client Portal / public-booking-page
mutations (questionnaire submit, meeting book/cancel — actorUserId is null there, actorName is a
Contact or guest name instead). Surfaced as a filterable feed at /admin/activity and a "Recent
activity" card on the Dashboard. Trimmed: no per-record activity tab (entityId isn't stored — see
the schema comment), no push-notification bell/read-state, no logging for lower-signal catalog
CRUD (Products, Price Books, Discounts, Document Templates, SOPs, Calendar events, Time entries) —
would mostly add noise, same reasoning Time Tracking was left out of Client Portal's scope.

While testing this, found and fixed a real pre-existing bug in features/tasks/actions.ts: creating
a Task in a project with zero milestones always failed validation. TaskForm omits the Milestone
`<select>` entirely when there are no milestones yet (same conditional-render pattern as the
Template `<select>` on Invoice/Proposal/Contract/Questionnaire), so `formData.get("milestoneId")`
came back `null` instead of `""` and failed the schema's `optionalId` (which only tolerates
undefined/""). Fixed with the same `?? ""` used at the other call sites — see the comment in
parseTaskForm.

Email Templates (#21) is the first *real* outbound email in this clone — everywhere else (Client
Portal invites, Meeting confirmations) had been explicitly trimmed for lacking it. Backed by
Resend (`lib/email.ts`; `RESEND_API_KEY`/`EMAIL_FROM_ADDRESS`, see .env.example) — one
env-configured sender for every workspace, no per-workspace custom domain/DNS verification. Two
new models: `EmailTemplate` (subject + body, `{{merge.field}}` tokens resolved by
features/email-templates/mergeFields.ts — a superset of document-templates' tokens, plus
`record`/`meeting`/`portal` fields for whatever the send is about) and `EmailLog` (mirrors
ActivityLog's shape on purpose — entityType + url, no per-record FK — since real inbound-reply
monitoring is out of scope for this pass; EmailLog's send outcomes, failures included, are the
practical stand-in for "monitor responses" here). Manual send only: a "Send Email" button on the
Invoice/Proposal/Contract/Questionnaire detail pages (`SendEmailButton`/`sendTemplatedEmailAction`)
lets a human pick a template, edit the merge-filled subject/body, and send — no automatic firing on
a status change. The three system-triggered types (MEETING_CONFIRMATION/MEETING_CANCELLED/
PORTAL_INVITE) are the exception, sent automatically from bookMeeting/cancelMeeting and
setContactPortalPassword once real delivery existed, closing out two long-standing "no outbound
email" trims from #19/#20 — each falls back to a built-in default template
(features/email-templates/defaults.ts) when a workspace hasn't created its own of that type yet,
since this codebase has no "seed default rows on workspace creation" step to hook a real seed into.
The Client Portal invite email deliberately never carries the actual password (the admin still
communicates it directly) — just a login link. Every send, successful or not, writes both an
EmailLog row and (on success) a normal ActivityLog entry via the sending feature's own
recordActivity call. Trimmed: no inbound reply capture/threaded inbox (a natural #24 if picked back
up), no automatic sends on status change, no CC/BCC/scheduling/attachments (no PDF generation
exists in this clone either), no per-workspace sending domain.

Everything below this line is *not yet built*.

Pick items in whatever order you like — just respect the "Requires" line. Items with no "Requires" line have no dependency on anything in this list and can be built anytime.

22. **Integrations** — Google/Outlook calendar sync, payment gateways (Stripe/PayPal/etc.).
    Calendar sync requires **Calendar** (#4); payments require **Invoices** (#15)

## Suggested natural groupings (not an order, just what tends to travel together)

- **CRM core**: 1, 7, 8
- **Delivery**: 9, 10, 11, 12, 13
- **Money**: 2, 14, 15, 16, 17, 18, 21, 22
- **Ops/polish**: 3, 4, 5, 6, 19, 20, 23
