# 01 — Clients

Source: `Clients` nav item → `/admin/clients` (list), `/admin/clients/:id` (detail)

## Purpose
Central "company/account" record (CRM company entity) that Contacts, Deals, Projects, Documents, and Invoices all roll up under.

## List view (`Client Dashboard`)
- Header: "Client Dashboard" + subtitle "View and manage your clients from here."
- Toolbar: search icon, **view switcher** dropdown (**Table** / **Grid**), **Filter** button (opens filter builder, not fully explored), **Import Clients** button (bulk CSV-style import), **Customize** button (likely column visibility/order config), **Add Client** primary button.
- Table columns: Client No. (auto id, e.g. `CLI-00002`, links to detail), Name, Legal Or[ganization Name] (truncated header), Email, Website, Headcount, Type, Subtype, Industry, Revenue, Actions (row `⋮` menu).
- Column headers show sort carets and a pencil icon (inline column rename/edit?) on several columns — suggests customizable/editable table columns.
- Footer: "Rows per page" selector (default 25), pagination, "Showing N results" count.
- Row `⋮` action menu not fully explored (likely Edit/Delete/View, consistent with other modules' patterns).

## Create — "Add Client" (right-side slide-over drawer)
Sections and fields:
- **Basic Information**
  - Client or Business Name * (text)
  - Legal Entity or Official Name (text)
- **Business Information**
  - Head Count (number)
  - Website * (text/URL)
  - Annual Revenue (number/currency)
  - VAT Number (text)
  - Email (email)
- **Classification**
  - Client Type * (select/dropdown)
  - Sub Type (text)
  - Industry * (select/dropdown)
  - Territory (text)
- **Additional Information**
  - Description (textarea)
  - Mark as Favorite (checkbox)
- Footer actions: Cancel / Save.
- Required fields marked with red asterisk: Client/Business Name, Website, Client Type, Industry.

## Detail view (`/admin/clients/:id`)
- Breadcrumb: Clients → [Legal Name].
- Header: avatar (initials, colored), client name (large), client no. + email + two more meta fields (currently blank placeholders "-").
- Top-right actions: **New Contact**, **New Deal**, **New Project**, **Edit**, and **⋮ more menu** → New To Do, New Note, New Proposal, New Contract, New Invoice, **Delete** (red).
- Left sub-navigation (collapsible via "Menu" toggle chevron):
  - **Details** — field grid: Name, Legal Name, Website, Email, Head count, Revenue, VAT Number, Industry, Client Type, Sub Type, Owner (assigned user), Created Date, Modified Date.
  - **Engagements** — list, empty state "No engagements found." (likely activity/interaction log — meetings, calls, emails).
  - **Contacts** — table scoped to this client's contacts (columns: Contact No., Name, Title, Email, Client, Phone, Owner, Status, Source, Type, Actions). Empty state: "No data found."
  - **Deals** — table scoped to client (Deal No., Name, Amount, Expected [Close Date], Stage, Status, Client, Contact, Owner, Deal Type, Actions). Empty state with **+** button: "No deals found. Get started by adding your first deal to the system."
  - **Projects** — table scoped to client (Project Co[de], Project Name, Client, Status, Progress [bar %], Start Date, End Date, Priority, Assigned To, Action). Example seen: `PMP-00001 / Web Design / 0% progress / Unassigned`.
  - **Documents** (expandable sub-group) →
    - **Proposals** — scoped table (Proposal No., Title, Client Name, Status, Created At, Updated At, Actions). Empty state: "No proposals found. Get started by creating your first proposal for clients."
    - **Contracts** — (not opened individually but same pattern expected)
    - **Questionnaires** — (same pattern expected)
  - **Finances** (expandable sub-group) →
    - **Invoices** — scoped invoice list for this client.
  - **Assets** — three drag-and-drop upload panels side by side: **Documents**, **Media**, **Designs** — each with its own "+ add" and folder icon, client-scoped file storage buckets by category.
- Right-side panel (persistent across sub-tabs): **Notes** (count badge, expandable, + add), **Todo** (count badge, expandable, + add), **Locations** (+ add; on this account it showed "Failed to fetch locations / Try again" — likely a maps/address integration erroring out or needing setup), **Team Members** (assigned staff to this client, + add, was "Loading team members...").

## Data model (inferred)
**Client**: id, client_no (sequential CLI-XXXXX), name, legal_name, website, email, head_count, annual_revenue, vat_number, industry, client_type, sub_type, territory, description, is_favorite, owner (user ref), created_at, updated_at.
Relationships: Client 1—N Contacts, 1—N Deals, 1—N Projects, 1—N Proposals/Contracts/Questionnaires/Invoices, 1—N Notes/Todos/Locations, N—N Team Members (users), 1—N Assets (Documents/Media/Designs).

## Open questions
- "Engagements" tab semantics not confirmed (likely a timeline/activity feed).
- "Locations" feature errored in this account — may depend on a maps API key/integration; worth designing as an optional module.
- Filter panel and Customize (column config) panels not opened in depth.
- Row-level `⋮` actions menu on the list not opened.
