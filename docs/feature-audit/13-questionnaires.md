# 13 — Questionnaires

Source: `Questionnaires` nav item → `/admin/questionnaires`

## Purpose
Client-facing intake forms/surveys — collect structured information from clients (onboarding questionnaires, briefs, feedback forms), part of the same template-driven document family as Contracts/Proposals/Invoices.

## List view (`All Questionnaires`)
- Header: "Questionnaires" + "View and manage all your questionnaires from here."
- Toolbar: **Filter**, **Customize**, **Create Questionnaire** (primary), **Create Template**.
- Table columns: Name, Client, Created, Updated, Status, Actions.
- Empty state: "No questionnaires found. Get started by creating your first questionnaire to collect information." + **Create Your First Questionnaire**.

## Create — "Add Questionnaire" (right-side drawer)
- "Select Questionnaire Templates" header + "How it works" explainer (same 3-step pattern as Contracts/Proposals/Invoices).
- Search Template box; "No Templates Found — Please create a new template" when empty.
- **Next** button is enabled even with no templates (same as Invoices) — template is optional, not a hard gate.
- (Did not proceed past template selection to avoid creating draft records; expect the next step to mirror Invoices' "Details" step — Name*, Client*, plus a question-builder for the actual form fields.)

## Data model (inferred)
**QuestionnaireTemplate**: id, name, category, description, owner, questions (structured field list), created_at.
**Questionnaire**: id, name, template_id (FK, optional), client_id (FK), status (Draft/Sent/Completed?), created_at, updated_at, responses (client-submitted answers, surfaced likely in Client Portal — see 14-client-portal.md).

## Open questions
- Question/field-builder UI (question types: text, multiple choice, file upload, rating, etc.) — not reached.
- Whether responses are visible inline in the admin dashboard or only via a separate "Responses" tab.
- How a client actually fills out a sent questionnaire (via Client Portal login, or a public unauthenticated link).
