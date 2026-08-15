# 08 — Time Tracking

Source: `Time Tracking` nav item → `/admin/tracking`

## Purpose
Account-wide/global rollup of time tracked across all projects (the per-project "Time Tracker" tab in 07-projects-tasks.md is the scoped version of this same feature).

## List view (`Time Tracker`)
- Header: "Time Tracker" + "Manage time for your Projects & Tasks".
- Toolbar: **Export** button, **Add Time Entry** (primary).
- **Tracked project cards**: one row per project with time logged — avatar/initial, project name, client name, a category/task-type pill (e.g. "DATABASE DEVELOPMENT" — matches the Project Category free-tag concept from 07), and total duration (HH:MM, right-aligned).
- Pagination: "1–1 of 1 Project" + prev/next arrows.
- (Clicking a project card likely drills into that project's time entries/Time Tracker tab — not confirmed, card click didn't visibly navigate in this pass.)

## Create — "New Time Entry" (centered modal)
- Client (select, "Select Client")
- Project (select, disabled until Client chosen — "Select Client First...")
- Task (select, disabled until Project chosen — "Select Project First...")
- Title (text, placeholder "Eg. Brand Building")
- Duration — HH:MM numeric input + a date field (defaults to today)
- Description/Notes (optional, textarea)
- Save button.
- Same cascading Client→Project→Task pattern used for the global "Log Time" quick action on the dashboard topbar (see 00-overview.md).

## Data model (inferred)
**TimeEntry** (same entity referenced in 07-projects-tasks.md's per-project Time Tracker): id, client_id, project_id, task_id (optional), title, duration_minutes, date, description, billable (implied from project-level filters), user/owner.

## Open questions
- **Export** button's output format (CSV/PDF) not confirmed.
- Whether this page supports filtering by date range/team member/client at the top level (the per-project Time Tracker tab has these filters; this global view did not show them explicitly, possibly because only one project has data).
- Click-through behavior of a tracked-project card.
