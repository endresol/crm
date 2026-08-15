# 11 — Invoices

Source: `Invoices` nav item → `/admin/invoices`

## Purpose
Client billing documents. Same "Documents" family as Contracts/Proposals but with a lighter-weight creation flow — a template is optional here, not required.

## List view (`Invoices Dashboard`)
- Header: "Invoices Dashboard" + "View all your client invoices here".
- Toolbar: **Filter**, **Customize**, **Create Invoice** (primary), **Create Template** (secondary). No "Table/Grid" view switcher shown (unlike Clients/Contacts/Deals).
- Table columns: Invoice Number, Invoice Name, Client, Status, Amount, Currency, Invoice Date, Due Date, Contact, Invoice Type, Actions.
- Empty state: "No invoices found. Get started by creating your first invoice for your clients." + **Create Your First Invoice**.

## Create — "Add Invoice" (right-side drawer, 2-step)
### Step 1: Invoice Templates
- "Invoice Templates" header + "How it works" explainer (same 3-step pattern as Contracts/Proposals).
- Search Template box; "No Templates Found — Please create a new template" when empty.
- **Unlike Contracts/Proposals, the "Next" button remains enabled even with zero templates** — a template is optional for invoices, not a hard gate.

### Step 2: Invoice Details
- **Invoice Name*** (text, required — validation shown live: "Invoice name is required")
- **Invoice Type** — a pill/card selector, default "This invoice is for a **Client**" (badge "C") — implies other invoice-subject types likely exist (e.g. "for a Project", "for a Deal"), though only the Client option was directly visible/clickable in this pass.
- **Client*** (searchable select + inline **+** create) — "Client is required" validation.
- **Billing Type*** (select, default **"One-time"** — the presence of a distinct billing-type field strongly implies a **"Recurring"** option too, i.e. subscription/recurring invoices).
- **Invoice Date** / **Due Date** (date pickers, both default to today).
- **Status** (read-only-looking field, default **"Draft"**).
- Footer: Back / **Create Invoice**.
- Line-item/product entry (quantities, unit price, tax, totals) was not reached in this pass — the single-step "Create Invoice" button (rather than a further "Next") suggests line items are added on the invoice **detail** page after creation, not in this initial modal.

## Create — "Create Template" (inferred identical to Contracts/Proposals pattern: Name, Category, Description, Build From Scratch / Use Default Template — not re-opened here since already verified twice).

## Data model (inferred)
**InvoiceTemplate**: id, name, category, description, owner, content.
**Invoice**: id, invoice_number, name, template_id (FK, optional), invoice_type (Client/Project/Deal?), client_id (FK), contact_id (FK), billing_type (One-time/Recurring), status (Draft/Sent/Paid/Overdue/...), invoice_date, due_date, currency, amount (derived from line items), line_items (1—N, referencing **Products** — see 06-products.md).

## Open questions
- Full Invoice Type option set beyond "Client".
- Recurring billing configuration (frequency, end condition) once "Recurring" is selected.
- Line-item builder UI (add product, quantity, discount, tax, computed total) — only reachable after creating a draft invoice, not tested to avoid creating real data.
- Payment collection/integration (Stripe or similar) — not surfaced yet; check Settings → Integrations.
- Full Status enum (Draft confirmed; Sent/Paid/Overdue/Void are typical but unconfirmed).
