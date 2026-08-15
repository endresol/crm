# 02 — Contacts

Source: `Contacts` nav item → `/admin/contacts` (list), `/admin/contacts/:id` (detail)

## Purpose
Person-level record (individual within/associated with a Client). Same list/detail/drawer pattern as Clients, one level down the hierarchy.

## List view (`Contact Dashboard`)
- Header: "Contact Dashboard" + subtitle "View and manage your contacts from here."
- Toolbar identical pattern to Clients: search, **Table/Grid** view switcher, **Filter**, **Import Contacts**, **Customize**, **Add Contact** (primary).
- Table columns: Contact No. (auto id, blank if not set), Name, Title, Email (mailto link), Client (linked client name), Phone, Owner, Status, Source, Type, Role, Actions.
- Row **⋮ actions menu**: **View Details**, **New To Do**, **Add Notes**, **View Projects**, **View Questionnaire**, **Delete** (red). (Row edit-in-place also possible — pencil icon appears next to Name on hover.)
- Footer: rows-per-page, pagination, result count — same as Clients.

## Create — "Create Contact" (right-side slide-over drawer)
- **Client Details** section (collapsible, header row w/ same column set as the client table: Status, Source, Type, Role) — a client-picker/mini-row where you either select an existing client inline or add one via a **+** button at the row's far right. Client selector shows "Loading clients..." async.
- **Contact Information**:
  - Full Name * (text)
  - Job Title (text)
  - Email Address * (text/email)
  - Phone (text)
  - Status (select, optional)
  - Source (select, optional)
  - Type (select, optional)
  - Role (select, optional)
- **Social Media** section: "+ Add Social Media" button, empty state "No social media links added yet."
- Footer: Cancel / Save Contact.
- Required: Full Name, Email Address.

## Detail view (`Contact Detail`, `/admin/contacts/:id`)
- Breadcrumb: [Client Name] → [Contact Name] (contacts are nested under their client in the breadcrumb).
- Header: avatar initials, contact name, meta row (phone placeholder, client name).
- Top-right actions: **New Deal**, **New Project**, **Social**, **Edit**, **⋮ more**.
- Left sub-nav: **Details**, **Engagement**, **Deals**, **Projects**, **Documents** (expandable), **Finances** (expandable) — mirrors the Client detail sub-nav minus "Assets".
- Details tab fields: Email, Phone, Job Title, Full Name, Customer Type, Role, Status, Source, **Client** (parent client link), Owner, Created By, Created Date.
- Right panel: **Notes**, **Todo**, **Locations**, **Socials** (list of social links, "+ Add your first social media link" empty state) — note this replaces Client detail's "Team Members" widget with "Socials" instead.

## Data model (inferred)
**Contact**: id, contact_no, full_name, job_title, email, phone, status, source, type, role, client_id (FK → Client), owner (user ref), created_by, created_at.
Relationships: belongs to one Client; has many Deals/Projects/Documents/Finances-scoped records same as Client sub-resources; has Notes, Todos, Locations, Social links.

## Open questions
- Exact options for Status/Source/Type/Role selects not enumerated (dropdowns were empty/loading during audit).
- "Engagement" tab (singular here vs "Engagements" plural on Client) content not opened — likely same activity-timeline concept.
- Whether a Contact can attach to multiple Clients (data shown suggests 1 client per contact).
