# ClientManager.io — Replica Spec (consolidated)

This is the consolidated functional spec for building a replica of ClientManager.io, based on a hands-on audit of the live product at `app.clientmanager.io` (August 2026). Per-module detail lives in `docs/feature-audit/`; this file is the cross-cutting summary: entity model, architecture shape, and a suggested build roadmap.

## What the product is

A vertical SaaS for freelancers/agencies: CRM (Clients/Contacts/Deals/Leads) + Project Management (Projects/Tasks/Time Tracking) + Client-facing Documents (Proposals/Contracts/Invoices/Questionnaires/SOPs) + a dedicated **Client Portal** on a separate subdomain, all wrapped in workspace settings, plan-based quotas, and third-party integrations. It is explicitly multi-tenant ("workspace" = tenant) with plan tiers (**Solo** = 1 seat, **Team** = multi-seat, implied higher tiers for White Label).

## Two front-ends, one backend

The single biggest architectural signal from the audit: this is **two separate applications**:
1. **Admin app** — `app.clientmanager.io/admin/*` — everything documented in `docs/feature-audit/00` through `15`.
2. **Client Portal app** — `portal.clientmanager.io` — a lighter, branded, per-client dashboard (dashboard, projects read access, documents, questionnaires, meeting requests, requests/notices). Admin users can toggle an "Edit View / Client View" of any client's portal from within the admin app. See `docs/feature-audit/14-client-portal.md`.

Both apps share the same underlying data (Clients, Projects, Documents, etc.) but expose very different, role-scoped views. Plan the replica's auth/permissions model around **two actor types**: Workspace **Users** (admin app, role-based — "Master Admin" confirmed, more roles likely on Team plan) and Client **Contacts** (portal app, scoped to their own Client's data only).

## Core entity model

```
Workspace (tenant)
 ├─ User (N, role-based: Master Admin, ...)
 ├─ Client
 │   ├─ Contact (N)
 │   ├─ Deal (N) ──stage/kanban pipeline──> Prospecting→Qualification→Proposal→Negotiation→Closed Won/Lost
 │   ├─ Project (N)
 │   │   ├─ Task (N) ──status──> To Do → Doing → Ready for QA → Blocked → Done
 │   │   ├─ Milestone (N, groups Tasks)
 │   │   ├─ TimeEntry (N)
 │   │   ├─ ProjectTeamMember (N, capacity/allocation)
 │   │   └─ ActivityLogEntry (N)
 │   ├─ Proposal / Contract / Invoice / Questionnaire (N each, template-based)
 │   ├─ Note / Todo / Location (N each)
 │   ├─ Asset (Documents / Media / Designs buckets)
 │   └─ ClientPortal (1:1 — activation status, widgets, requests)
 ├─ Lead (N, separate pre-Client pipeline: New→Unqualified→Contacted→Qualified→Convert, convertible to Client)
 ├─ Product (N, catalog) ──priced via── PriceBook (N) + Discount (N)
 ├─ Template (ProposalTemplate / ContractTemplate / InvoiceTemplate / QuestionnaireTemplate — user/workspace-scoped library)
 ├─ EmailTemplate (N, per module + lifecycle event, e.g. invoice_overdue)
 ├─ MeetingSchedule (N, Calendly-style booking pages) ──> Booking (N)
 ├─ CalendarEvent (N, lightweight personal events)
 ├─ SOP (N, rich-text internal docs)
 ├─ Integration (N: Google, Outlook, PayPal, Square, Authorize.net, Venmo, Stripe)
 └─ PlanQuota (per module, tied to Workspace.plan)
```

Relationships worth calling out:
- **Deal** and **Invoice/Contract** can optionally reference a **Deal**, but the primary anchor for almost everything is **Client**.
- **Contact** belongs to exactly one **Client** (not many-to-many in what was observed).
- **Task**, **Milestone**, **TimeEntry**, **ProjectInvoiceView** all nest under **Project**, which nests under **Client**.
- **Products** feed into Proposals/Invoices as line items (not confirmed end-to-end, but the module exists specifically for this).
- **Lead → Client** is a one-way conversion action, not a live relationship.
- Every document type (Proposal/Contract/Invoice/Questionnaire) follows the **identical creation flow**: pick a Template (optional for Invoice/Questionnaire, required-in-spirit for Contract/Proposal) → fill a Details form (Client, dates, type-specific fields) → a builder step to customize content → send. Build this as **one shared "document" subsystem** with a `document_type` discriminator rather than four separate systems.

## Cross-cutting patterns to replicate (seen repeatedly across modules)

- **List page chrome**: search, view switcher (Table/Grid or Table/Group-by-kanban), Filter, Customize (column config), primary Create button, sometimes Import.
- **Kanban-by-group-by**: Deals and Leads both support switching a list into drag-and-drop lanes grouped by any status-like field (Stage, Status, Priority, Deal Type, Lead Source).
- **Right-side slide-over drawers** for create/edit forms on Clients/Contacts/Deals/Projects/Invoices; **centered modals** for lighter create flows (Leads, Discounts, Price Books, Time Entries, Calendar events).
- **Inline "+" quick-create**: Client/Contact pickers inside other forms (Deal, Project, Invoice, Contact) let you create the referenced record without leaving the form.
- **Detail page pattern**: left icon+label sub-nav (Details/Engagements/Contacts/Deals/Projects/Documents/Finances/...) + a persistent right-side panel (Notes/Todo/Locations/Team or Socials) + top-right primary actions + `⋮` overflow menu with quick-creates and Delete.
- **Activity log**: a generic polymorphic feed ("[User] created a new [Entity]") attached to Projects (confirmed) and implied for Clients ("Engagements" tab).
- **Global quick actions in the topbar**: Reminders, Notifications, Goals (light gamification), a global "Log Time" quick modal, and a "NEW ▾" dropdown for fast record creation from anywhere.
- **Plan-gated quotas**: every core module (Clients, Contacts, Deals, Projects, Proposals, Contracts, Invoices, Questionnaires, Templates) has a numeric cap tied to the subscription plan, shown as a usage meter in Settings.

## Suggested build roadmap (for the replica)

1. **Foundation**: Workspace/tenant model, User auth + roles, Client + Contact CRUD (establishes the list/detail/drawer UI pattern reused everywhere).
2. **CRM loop**: Deals (with kanban), Leads (with convert-to-client), Products/Pricing.
3. **Delivery loop**: Projects → Tasks (kanban/gantt) → Milestones → Time Tracking (project-scoped and global).
4. **Money loop**: Invoices (template-optional) → Products as line items → payment integration stub → Contracts/Proposals (template-required, document builder) → Questionnaires.
5. **Client-facing surface**: Client Portal app (separate subdomain or at least a separate route namespace + auth), starting read-only (dashboard, projects, documents) then adding requests/meetings/questionnaire-filling.
6. **Polish/ops**: Settings (workspace config, branding, quotas, integrations, email templates), Calendar + Meeting Scheduler, SOPs, notifications/activity log.

## Open questions carried over from module docs

See each `docs/feature-audit/*.md` file's "Open questions" section for specifics. The highest-impact unknowns to resolve before implementation:
- Exact document-builder UX for Contracts/Proposals (clause editing) — not opened, to avoid creating real drafts in the audited account.
- Full enum values for Status/Stage/Type fields across Deals, Leads, Tasks, Invoices, Contracts (several were only partially observed due to empty seed data).
- Client Portal's authentication model and exact feature parity with the admin-side document/request flows.
- Whether "Recurring" billing (implied by Invoice's Billing Type field) is fully built or partial.

## Source material

`docs/feature-audit/`:
- `00-overview.md` — global nav, topbar, dashboard
- `01-clients.md`, `02-contacts.md`, `03-deals.md`, `05-leads.md`, `06-products.md`
- `04-calendar.md`
- `07-projects-tasks.md`, `08-time-tracking.md`
- `09-contracts.md`, `10-proposals.md`, `11-invoices.md`, `12-sops.md`, `13-questionnaires.md`
- `14-client-portal.md`
- `15-settings.md`
