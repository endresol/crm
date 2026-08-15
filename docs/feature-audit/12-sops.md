# 12 — SOPs

Source: `SOPs` nav item → `/admin/sop-dashboard` (list), `/admin/sop-dashboard/:id` (doc editor/viewer)

## Purpose
Internal knowledge-base / Standard Operating Procedure documents — a lightweight Google-Docs-style rich text editor for process documentation, distinct from the client-facing Contracts/Proposals/Invoices trio. Can be authored in-app or uploaded as an existing file.

## List view (`SOP Dashboard`)
- Header: "SOP Dashboard" + "Create, view, edit and send SOPs" (subtitle implies SOPs can also be **sent**, e.g. shared with a client/team member via the share icon below).
- Toolbar: search, **Create SOP** (primary), **Upload SOP** (upload an existing file instead of authoring one — not tested).
- List is a flat numbered list (`#1`, `#2`, ...) of SOP titles, each row with 4 icon actions: **view** (eye), **share**, **edit** (pencil), **delete** (trash, red).

## Create — "Create SOP"
- Clicking **Create SOP** immediately opens a new document (auto-creates a draft record, similar to "New" in Google Docs — navigating away without saving still leaves an "Untitled SOP" entry in the list, confirmed during this audit).
- Editor page (`SOP Detailed View`): **Title** field (editable), **Download** button, **Save** button.
- Body: a rich, pre-filled **boilerplate SOP template** with headings: **"Standard Operating Procedure (SOP)"** → **Objective** (placeholder: "The objective of this SOP is to provide clear guidelines for [specific purpose, e.g., handling customer support tickets].") → **Scope** (placeholder: "This SOP applies to all employees involved in [specific area, e.g., customer service, product quality checks].") → **Responsibilities** (empty, ready for content) — a rich-text/WYSIWYG document body, editable inline.
- Opening an **existing** SOP via the eye/view icon shows the same page in **read-only** mode: "Read Only" label next to Title, Save button disabled, Download still available.

## Data model (inferred)
**SOP**: id, title, content (rich document/HTML), status (draft/published?), created_at, updated_at, shared_with (via the share action).

## Open questions
- "Share" action's mechanics (share link vs. share to a specific Client Portal vs. internal team member).
- "Upload SOP" flow (file types accepted, whether it's parsed into the rich editor or stored as an opaque attachment).
- Whether SOPs can be linked to a Client/Project (no such association was visible in the list or editor).
- Whether "Download" exports to PDF/DOCX.
