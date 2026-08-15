# 09 — Contracts

Source: `Contracts` nav item → `/admin/contracts`

## Purpose
Template-driven contract/e-signature-style document generation, sent to clients for review/signature. Part of the "Documents" nav group alongside Proposals, Invoices, SOPs, Questionnaires — these five modules likely share a common document-builder/template infrastructure.

## List view (`Contracts Dashboard`)
- Header: "Contracts Dashboard" + "View and manage your contracts from here."
- Toolbar: **Table** view switcher, **Filter**, **Customize**, **Add Contract** (primary), **Create Template** (separate, secondary button).
- Table columns: Contract No., Contract N[ame], Client, Status, Contract Type, Start Date, End Date, Contract Value, Deal (link — contracts can be associated with a Deal, not just a Client), Created By, Actions.
- Empty state: "No data found. There are no items to display at the moment."

## Create — "Add Contract" flow (template-first, 3-step wizard)
Opening "Add Contract" shows a **template picker** first ("Custom Contract Templates from '[User]'s personal'" — workspace/user-scoped template library), with an inline **"How it works"** explainer:
1. **Select a Template** — choose an existing contract template, or create a new one if none exist.
2. **Create Contract** — fill out the contract form; provide client and contact details for who the contract should be sent to.
3. **Review & Send** — once the draft contract is created, build/modify/extend clauses and terms using a **contract builder**, then send the contract to the client.
- If no templates exist: "No Templates Found — Please create a new template." (blocks proceeding — a template is required before creating a contract).

## Create — "New Contract Template" (centered modal)
- Name (text, "Template Name")
- Select Category (combobox, "+Add Category" — free-form categories, same pattern as Products/Projects)
- Description (textarea)
- Two creation paths: **Build From Scratch** (opens a template/clause builder — not entered, to avoid creating real data) or **Use Default Template** (starts from a pre-built starter template).

## Data model (inferred)
**ContractTemplate**: id, name, category, description, owner (user-scoped library), clauses/content (rich document structure), created_at.
**Contract**: id, contract_no, name, template_id (FK), client_id (FK), contact_id (FK), deal_id (FK, optional), status (Draft/Sent/Signed/...), contract_type, contract_value, start_date, end_date, created_by, content (built from template + edits).

## Open questions
- Exact clause/term builder UI (not opened, to avoid creating a real template record).
- Contract Status and Contract Type enum values.
- Whether "Review & Send" includes e-signature capture, or just a send-for-review email/link.
- Relationship between Contract and Deal — does converting a Deal to "Closed Won" suggest creating a Contract, or is linking manual?
