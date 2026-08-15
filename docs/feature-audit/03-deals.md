# 03 — Deals

Source: `Deals` nav item → `/admin/deals`

## Purpose
Sales pipeline / opportunity tracking (CRM deal entity), separate from Leads. Deals are attached to a Client (+ optional Contact) and move through pipeline stages toward Closed Won/Lost.

## List view (`Deals Dashboard`)
- Header: "Deals Dashboard" + "View and manage your deals from here."
- Toolbar: search, **view switcher**: **Table** vs **Group by** (Group by → Status | Stage | Priority | Deal Type | Lead Source), **Filter**, **Customize**, **Add Deal** (primary). (No Import button here, unlike Clients/Contacts.)
- **Table view columns**: Deal No., Name, Amount, Expected [Close Date], Stage, Status, Client, Contact, Owner, Deal Type, Expected C[lose?]..., Actions.
- **Group-by / Kanban view** (e.g. grouped by Stage, `?view=groupBy.stage`): columns rendered as drag-and-drop kanban lanes with colored headers and a count badge per lane:
  - **Prospecting**, **Qualification**, **Proposal**, **Negotiation**, **Closed Won** (5 default stages — "Closed Lost" likely exists too, off-screen to the right; scroll bar present).
  - Empty-lane placeholder text: "column is empty! drop the card here to move...".
  - Cards are presumably draggable between lanes to update a deal's Stage (classic CRM kanban pattern).
- Empty state (no deals at all): centered **+** icon, "No deals found. Get started by adding your first deal to the system." + **Add Your First Deal** button.

## Create — "Add New Deal" (right-side slide-over drawer)
- **Basic Information**
  - Deal Name * (text)
  - Deal Type * (select)
  - Description (textarea)
- **Client & Contact**
  - Client * — searchable select ("Search and select a client") + inline **+** to create a new client on the fly.
  - Contact — searchable select, disabled until Client is chosen ("Select a client first") + inline **+** to create a new contact.
- **Financial Information**
  - Deal Amount * (number) + **Currency** * (select, default USD)
  - Discount (number, optional)
- **Deal Management**
  - Stage * (select, default "Prospecting" — matches kanban lane names)
  - Status * (select, default "Open")
  - Priority (select, default "Medium")
  - Lead Source (select, optional)
- **Important Dates**
  - Expected Close Date * (date picker)
  - Next Follow-up Date (date picker, optional)
- **Additional Information**
  - Next Step (text)
- Footer: Cancel / Save.

## Data model (inferred)
**Deal**: id, deal_no, name, deal_type, description, client_id (FK), contact_id (FK, optional), amount, currency, discount, stage (enum: Prospecting/Qualification/Proposal/Negotiation/Closed Won/[Closed Lost]), status (enum: Open/...), priority (Low/Medium/High), lead_source, expected_close_date, next_follow_up_date, next_step, owner, created_at.
Relationships: belongs to Client, optionally to Contact; the client/contact "+" inline-create affordance is a reusable pattern seen across modules (quick-create without leaving the current form).

## Open questions
- Full Stage/Status/Priority/Deal Type/Lead Source option lists not enumerated (this account has no seed data).
- "Closed Lost" stage existence not directly confirmed — inferred from CRM convention and the horizontal scrollbar on the kanban.
- Row `⋮` actions on the deal table not opened (assume same View/Edit/Delete pattern as Clients/Contacts).
