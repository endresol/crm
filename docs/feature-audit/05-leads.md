# 05 — Leads

Source: `Leads` nav item → `/admin/leads`

## Purpose
Pre-Deal, pre-Client pipeline for inbound prospects (e.g. captured from a marketing site form). Leads have their own status pipeline and can be **converted into a Client** once qualified.

## List view (`Leads Pipeline`)
- Header: "Leads Pipeline" + "Track the progress of your leads".
- Toolbar: search, **Table** view switcher (likely also has a Group-by/kanban mode like Deals, not confirmed), **Filter**, **Customize**, **Add Lead** (primary), **Archived Leads** (separate button — leads can be archived instead of/before deletion).
- Table columns: Lead No. (e.g. `LED-00002`, links to detail modal), Name, Email, Phone, Business Name, Budget, **Source** (chip, e.g. "Marketing Site" — suggests leads can be captured via an embeddable web form/API, not just manual entry), Status, **Rating** (1–5 star), Comments (count), Actions.

## Lead detail (modal overlay, `?cardId=...&modal=lead_details`)
- Header: avatar initial, lead/business name, business name, email, phone.
- **Status stepper** (horizontal pill row, click to advance): **New → Unqualified → Contacted → Qualified → Convert** — a distinct 5-stage pipeline from Deals' stage set.
- **Details** grid: Business Name, Budget (currency), Website (link), Date Added, Rating (star picker).
- **Lead source** dropdown (inline, e.g. "Marketing Site").
- **Description** textarea (freeform notes).
- **Comments/collaboration panel** (right side): threaded comments with "Write comment...", and formatting toolbar (attachment, emoji, text formatting "Aa", @mention, send) — team collaboration on a lead before conversion.
- Footer actions: **Delete** (red), **Edit details**, **Convert to Client** (primary) — the key conversion action that (presumably) creates a new Client record pre-filled from the lead's data.

## Create — "Add Lead" (centered modal, simpler than Client/Contact drawers)
Fields: Name, Email, Business, Website (optional), Budget (optional, with currency selector e.g. USD/AED), Phone Number (with country-code selector). Single button: **ADD TO LEADS**.

## Data model (inferred)
**Lead**: id, lead_no, name, email, phone, business_name, website, budget, currency, source, status (New/Unqualified/Contacted/Qualified/Convert), rating (1-5), description, date_added, archived (bool), comments (1—N).
On conversion: Lead → Client (mapping business_name→name, email, phone, website, budget→revenue(?), etc. — exact field mapping not confirmed).

## Open questions
- Whether Leads list also supports a Group-by/Kanban view like Deals (toolbar only showed "Table" here, not "Table / Group by" — worth re-checking).
- Exact Convert-to-Client field mapping and whether it also offers creating a Deal/Project at the same time.
- "Archived Leads" view contents not opened.
- How a lead's "Source: Marketing Site" gets populated — likely an embeddable form/webhook/public API endpoint that's part of ClientManager's own lead-capture product (relevant if replicating: consider a public lead-intake endpoint per account).
