# Feature backlog (Phase 4+)

Done — see git log / SPEC.md: Auth, Clients, Time Tracking (scoped to Client), **Contacts** (#1),
**Products & Pricing** (#2), **SOPs** (#3), **Calendar** (#4), **Team members & roles** (#5),
**Workspace settings** (#6), **Deals** (#7), **Leads** (#8), **Projects** (#9), **Tasks** (#10),
**Milestones** (#11), **Gantt chart view** (#12),
**Upgrade Time Tracking to log against Project/Task** (#13), **Document Templates system** (#14),
**Invoices** (#15), **Proposals** (#16), **Contracts** (#17), **Questionnaires** (#18),
**Client Portal** (#20).

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

Everything below this line is *not yet built*.

Pick items in whatever order you like — just respect the "Requires" line. Items with no "Requires" line have no dependency on anything in this list and can be built anytime.

19. **Meeting Scheduler** — Calendly-style public booking pages.
    Requires: **Calendar** (#4)
21. **Email templates** — customizable transactional emails (invoice sent/overdue, proposal sent, etc.).
    Requires: the document type they're for (#15–18)
22. **Integrations** — Google/Outlook calendar sync, payment gateways (Stripe/PayPal/etc.).
    Calendar sync requires **Calendar** (#4); payments require **Invoices** (#15)
23. **Activity log / notifications** — audit trail across entities.
    No hard dependency, but more useful once several entity types exist — good candidate for later.

## Suggested natural groupings (not an order, just what tends to travel together)

- **CRM core**: 1, 7, 8
- **Delivery**: 9, 10, 11, 12, 13
- **Money**: 2, 14, 15, 16, 17, 18, 21, 22
- **Ops/polish**: 3, 4, 5, 6, 19, 20, 23
