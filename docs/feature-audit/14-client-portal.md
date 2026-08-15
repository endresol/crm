# 14 — Client Portal

Source: `Client Portal` nav item → `/admin/settings/client-portal` (admin-side activation/management page). The actual client-facing portal lives on a **separate subdomain**: `https://portal.clientmanager.io/`.

## Purpose
A branded, per-client mini-dashboard the admin can activate for any Client, giving that client's contacts self-service access to their projects, files, meetings, questionnaires, and requests — without full admin access. This is the biggest architectural signal in the whole audit: **the replica needs two separate front-ends** (admin app + client portal app), likely on separate subdomains, sharing the same backend/data model with per-role access control.

## Admin management page (`Client Portal` under Settings)
- Breadcrumb: Settings → Client Portal.
- Two collapsible explainer panels (product-education copy, not functional UI):
  - **"What is client portal?"** — "Think of it as a dashboard where you can collaborate with your client." Capabilities listed: Schedule meetings, Work on projects, See documents, See notices, See client requests. Explicitly two views of the same portal: **"You" (the user) have your view. The 'client' has their view."** — i.e. the admin can toggle into a client's-eye view of their own portal for editing/preview.
  - **"How does it work?"** — Activate a client's portal → client receives an **email invite** (with a spam-folder warning) to activate → client logs in at `https://portal.clientmanager.io/` → the same link can be reused for all clients with active portals, and can be embedded/linked from the agency's own website → admin customizes each client's portal by logging into `https://portal.clientmanager.io/` with their **main account** and selecting the relevant client portal to edit it.
  - Includes an embedded demo video ("Client Portal Demo") whose thumbnail reveals the portal's actual UI (see below).
- **"Activate Client Portals"** section: search box + a list of all Clients, each with an **Invite** button (sends the activation email — not triggered during this audit, per this session's messaging-permission rules).

## Client Portal UI (inferred from the demo screenshot/video thumbnail)
- Own branded topbar: ClientManager logo, notification bell, avatar.
- When an admin is inside a client's portal in edit mode, a banner reads **"You're editing [Client]'s client portal"** with an **EDIT VIEW / CLIENT VIEW** toggle — confirming the dual-view concept from the explainer.
- **Left sidebar**:
  - **Request Meeting** — "Share Availability Schedule" button (ties into the Meetings/scheduling feature from 04-calendar.md).
  - **Confirmed Meeting** section.
  - **Questionnaires** — list of assigned questionnaires with live progress, e.g. "Onboarding for Bob The Builder — 1 Question Left", "Web Design In-Take Form — 4 Questions Left", "Default Questionnaire — 13 Questions Left" (ties into 13-questionnaires.md; confirms questionnaires are filled out by the client through this portal).
  - Share and history icons at the bottom.
- **Main dashboard**: "Welcome back, [Contact Name]" + "Here's a summary of how things stand:", 3 stat tiles — **Requests**, **Meetings**, **Files & Assets** (counts). An **"+ Actions"** row with admin-configurable widgets: **Edit iFrame** (embed arbitrary content/tools into the client's dashboard) and **Edit Notices** (post announcements to the client) — both editable only from the admin/edit view. Below that, a **"Projects & Tasks"** section ("View All" link) showing project cards (e.g. Website Design, SEO, New Project Name) with assigned-team avatars and an **"Edit Access"** control per project (so the admin can control which projects a given client contact can see).
- **Right sidebar**: **Requests** panel (client-submitted requests, empty state "No requests", with a help "?" icon) and **Contacts** panel (the client-side point of contact, e.g. "Project Manager — Fred — email", with an Edit link).

## Data model (inferred)
**ClientPortal**: id, client_id (FK, 1:1 with Client), status (active/inactive), invited_at, activated_at.
**PortalWidget**: iframe embeds, notices — admin-configurable content shown on a specific client's portal.
**ClientRequest**: id, client_portal_id, subject/description, status — a lightweight support/ask-ticket raised by the client through the portal.
**ProjectAccess**: project_id, client_portal_id (or contact_id), visible (bool) — per-project visibility control into the portal.

## Open questions
- Exact auth model for `portal.clientmanager.io` (separate login/session from the admin app, presumably tied to Contact records, not admin Users).
- What "Files & Assets: 33" aggregates — likely the Assets buckets (Documents/Media/Designs) seen in 01-clients.md.
- Full Request lifecycle (client raises a request → admin sees/responds where? possibly surfaces as a Todo or Notification in admin).
- Whether Invoices/Proposals/Contracts sent to a client are also visible/actionable (pay, accept, sign) from within this portal — highly likely given "See documents" is explicitly listed, but not directly observed.
