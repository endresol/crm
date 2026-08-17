# Feature backlog (Phase 4+)

Done — see git log / SPEC.md: Auth, Clients, Time Tracking (scoped to Client), **Contacts** (#1),
**Products & Pricing** (#2), **SOPs** (#3), **Calendar** (#4), **Team members & roles** (#5),
**Workspace settings** (#6), **Deals** (#7), **Leads** (#8), **Projects** (#9), **Tasks** (#10),
**Milestones** (#11), **Gantt chart view** (#12),
**Upgrade Time Tracking to log against Project/Task** (#13), **Document Templates system** (#14),
**Invoices** (#15), **Proposals** (#16), **Contracts** (#17).

`DocumentTemplate` is a single shared model (type: PROPOSAL/CONTRACT/INVOICE/QUESTIONNAIRE) with
`{{merge.field}}` tokens (features/document-templates/mergeFields.ts) resolved against a Client/
Workspace when a document is generated — but each document type (Invoice built; Proposal/
Contract/Questionnaire not yet) still gets its own content model (line items vs. clause text vs.
Q&A), not one shared polymorphic table — their content shapes differ too much for that to be a
good idea. See the merge-field template system and content models discussion in chat around
2026-08-17 if picking this back up.

Everything below this line is *not yet built*.

Pick items in whatever order you like — just respect the "Requires" line. Items with no "Requires" line have no dependency on anything in this list and can be built anytime.

18. **Questionnaires** — intake forms sent to clients.
    Requires: **Document Templates** (#14)
19. **Meeting Scheduler** — Calendly-style public booking pages.
    Requires: **Calendar** (#4)
20. **Client Portal** — separate login/app for client Contacts to see their own projects/documents/invoices.
    Requires: **Contacts** (#1). Gets more useful once Projects (#9) and Invoices/Proposals (#15–16) exist, but can start earlier as a bare-bones shell.
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
