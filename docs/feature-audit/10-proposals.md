# 10 — Proposals

Source: `Proposals` nav item → `/admin/proposals`

## Purpose
Template-driven sales proposal documents sent to clients/leads — sibling module to Contracts, sharing the identical template-first creation flow and document-builder infrastructure.

## List view (`Proposals Dashboard`)
- Header: "Proposals Dashboard" + "View and manage your proposals from here."
- Toolbar: **Table** view switcher, **Filter**, **Customize**, **Add Proposal** (primary), **Create Template**.
- Table columns: Proposal No., Proposal Title, Client Name, Status, Created At, Updated At, Actions.
- Empty state: "No proposals found. Get started by creating your first proposal for clients."

## Create — "Add Proposal" flow
Identical pattern to Contracts (see 09-contracts.md):
- Template picker: "Custom Proposal Templates from '[User]'s personal'" + "How it works" explainer (same 3-step: Select a Template → Create Proposal → Review & Send, inferred from the Contracts flow — not re-expanded here since it matched exactly).
- "No Templates Found — Please create a new template" when the library is empty.
- **Create Template** modal is presumed identical in shape to Contracts' (Name, Select Category, Description, Build From Scratch / Use Default Template) given the shared UI chrome — not re-verified field-by-field.

## Data model (inferred)
**ProposalTemplate**: id, name, category, description, owner, content, created_at.
**Proposal**: id, proposal_no, title, template_id (FK), client_id (FK), status (Draft/Sent/Viewed/Accepted/Declined — typical proposal lifecycle, not directly confirmed), created_at, updated_at.
Likely references **Products** (06-products.md) as line items within the proposal body, mirroring how Invoices would use them — not directly confirmed since no proposal was built end-to-end.

## Open questions
- Whether Proposals support e-signature/"Accept" client-facing actions (would surface in Client Portal — see 14-client-portal.md).
- Full Status enum.
- Whether the proposal builder embeds the Products/Price Book catalog for line-item pricing (strongly likely given Products module exists specifically for "products and services" pricing).
- Relationship to Deals: does accepting a proposal advance a linked Deal's stage automatically?
