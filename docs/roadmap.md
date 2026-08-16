# Feature backlog (Phase 4+)

Done — see git log / SPEC.md: Auth, Clients, Time Tracking (scoped to Client), **Contacts** (#1),
**Products & Pricing** (#2), **Deals** (#7), **Projects** (#9), **Tasks** (#10), **Milestones** (#11),
**Gantt chart view** (#12), **Upgrade Time Tracking to log against Project/Task** (#13).

Everything below this line is *not yet built*.

Pick items in whatever order you like — just respect the "Requires" line. Items with no "Requires" line have no dependency on anything in this list and can be built anytime.

3. **SOPs** — internal rich-text documents (standalone knowledge base).
4. **Calendar** — basic events (add/view, month view).
5. **Team members & roles** — invite more users into a workspace, roles beyond Master Admin.
6. **Workspace settings** — name, branding colors, timezone/currency/date format.
8. **Leads** — pre-client pipeline with a "Convert to Client" action.
   Requires: **Contacts** (#1) — done, see above; conversion creates a Client + Contact
14. **Document Templates system** — shared template/builder infrastructure used by Invoices, Proposals, Contracts, and Questionnaires. Build this before #16–18.
15. **Invoices** — billing documents with line items.
    Requires: **Products & Pricing** (#2). Templates (#14) optional, not required.
16. **Proposals** — sales documents with line items, sent to clients.
    Requires: **Document Templates** (#14), **Products & Pricing** (#2)
17. **Contracts** — legal documents built from templates.
    Requires: **Document Templates** (#14)
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
