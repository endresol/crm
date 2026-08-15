# 07 — Projects & Tasks

Source: `Projects & Tasks` nav item → `/admin/tasks` (project list), `/admin/projects/:id` (project detail)

## Purpose
Core project-management module: Clients have Projects, Projects have Tasks/Milestones/Time tracking/Team/Invoices/Activity — the most feature-dense module audited so far.

## List view (`Projects`)
- Header: "Projects" + "View and manage your projects from here."
- Toolbar: search, **Table** view switcher, **Filter**, **Customize**, **Create New Project** (primary).
- Table columns: Project Code (e.g. `PMP-00001`, links to detail), Project Name, Client, Status, Progress (%, bar), Start Date, End Date, Priority, Assigned To, Action.

## Create — "Create New Project" (right-side drawer)
- **Basic Information**: Project Name * (text), Description (textarea, optional — nudge text "Consider adding a description for better project clarity"), Start Date * / End Date * (date pickers).
- **Client & Contact**: Client * (searchable select + inline **+** create), Contact (select, disabled until Client chosen, + inline create) — same reusable pattern as Deals/Contacts.
- **Category**: Project Category * — combobox that supports **"Select or Create Category..."** (free-form tag-style categories).
- **Project Details**: Due Date (separate from End Date — likely a soft target vs hard deadline), Budget (currency selector default USD + amount).
- Footer: Cancel / Create Project.

## Project detail (`Project Details`)
- Breadcrumb: [Client] → [Project Name]. Header: avatar initials, project name, meta row (code · status · client · "Invalid Date" — a date field bug/placeholder in this seed data).
- Top actions: **New Task**, **New Milestone**, **Start Timer** (global project timer), **Add Time Entry**, **Edit**, **⋮ more**.
- Left sub-nav: **Overview**, **Gantt Chart**, **Tasks**, **Milestones**, **Time Tracker**, **Invoices**, **Team**, **Activity**.

### Overview
- **Task Overview** stat row: Not Started / In Progress / Completed / Urgent counts + a "Total" badge.
- **Project Information** editable panel: Project Name, Client (card w/ avatar+email), Project Status, Category Tags, Start Date, End Date, Completion Rate (%, progress bar).
- **Team Members** panel: Assigned To avatars + "Manage Team" link; empty state "No team members assigned / Add members to get started".
- **Budget & Financials** panel: Allocated Budget, Budget Utilization (%, progress bar), Remaining Budget ($).
- **Project Description** rich textarea at the bottom, with a "Save Changes" button that activates once edited (inline-editable overview, not a separate edit form).

### Gantt Chart
- Toggle between **Tasks** / **Milestones** timeline.
- View controls: zoom in/out, **Week / Month / Quarter / Today**.
- Color legend for task status: **To Do** (gray), **Doing** (blue), **Ready for QA** (purple), **Blocked** (red), **Done** (green) — this is the canonical task-status enum for the whole module.
- Empty state: "No tasks with dates to display."

### Tasks (`All Task`)
- Toolbar: search, **Table** view toggle (likely also Kanban board, not directly confirmed but strongly implied by the To Do/Doing/Ready for QA/Blocked/Done status set), **Filter**, **Customize**, **Bulk Create** (distinctive — lets you add many tasks at once, e.g. paste a list).
- Table columns: Task no., Name, Type, Sub type, Status, Assigned to, Due date, Priority, Comm[ents count], Actions.
- **Create Task modal** (rich):
  - Title * (text)
  - Type (select, default "General") / Sub Type (select, dependent on Type)
  - Status (select, default "To Do (Default)")
  - Assignees (multi-select "Assign members...")
  - Start Date (defaults to today) / Due Date
  - Tags (multi-select)
  - Priority (select, default "Normal")
  - Description — **rich text editor** (Bold/Italic/Underline/Strikethrough/inline-code/bullet+numbered list/indent/link/undo/redo) with an additional lower comment-style toolbar (emoji, text styles "Aa", @mention) suggesting the description box doubles as a first comment/discussion entry.
  - Footer: Cancel / Create.

### Milestones
- List of milestones (click a row to view its associated tasks — filtering tasks by milestone).
- Toolbar: **Bulk Create**.
- Empty state: "No milestones — Get started by creating a new milestone for your project." + **Create Milestone** button.

### Time Tracker
- Stat cards: Total Estimated Hours, Total Actual Hours, Actual Hours By Members (count), Time Distribution (task count).
- Filters: Team Member, Task, Billable (dropdowns), Start Date–End Date range, free-text search.
- **Time Entries** table: Team Member, Task, Date, Time Logged, Description, Billable, Action.

### Invoices (`Project Invoices`)
- Table scoped to this project's invoices: Invoice Num, Invoice Name, Client, Status, Amount, Currency, Invoice Date, Due Date, Contact, Invoice Type, Actions.
- Empty state: "No invoices found. Get started by creating your first invoice for your clients."

### Team (`Team Overview`)
- Period selector ("This week", date range shown) + **Table** view toggle + **Add Members**.
- Stat row: Active Members, Team Capacity (hrs), Allocated (hrs), Logged (hrs), Utilization (%) — real resource-management/capacity-planning feature.
- Empty state: "No team members assigned" + Add Members.

### Activity (`Project Activity`)
- Simple audit-log feed: actor avatar, action text (e.g. "Endre Solem created a new **Project**"), relative timestamp ("5 months ago"). Same activity-log pattern likely reused across Clients/Deals/etc. ("Engagements" tab elsewhere may be this same feed).

## Data model (inferred)
**Project**: id, project_code, name, description, client_id (FK), contact_id (FK, optional), category (free-form tag), status, start_date, end_date, due_date, budget_amount, budget_currency, completion_rate, priority, created_at.
**Task**: id, task_no, project_id (FK), title, type, sub_type, status (To Do/Doing/Ready for QA/Blocked/Done), assignees (N—N users), start_date, due_date, tags (N—N), priority, description (rich text), comments (1—N).
**Milestone**: id, project_id (FK), name, tasks (1—N Task, milestone_id FK on Task presumably).
**TimeEntry**: id, project_id (FK), task_id (FK, optional), team_member (FK user), date, duration, description, billable (bool).
**ProjectTeamMember**: project_id, user_id, capacity_hours, allocated_hours, logged_hours (derived from TimeEntry).
**ActivityLogEntry**: id, subject_type/subject_id (polymorphic — Project, Client, etc.), actor (user), action, created_at.

## Open questions
- Whether Tasks list has a Kanban/board view in addition to Table (status enum strongly suggests one exists, matching the Gantt legend).
- Task "Type"/"Sub Type" full option lists.
- Milestone creation form fields (only saw the empty-state entry point).
- Exact relationship between Project "Due Date" (Project Details) vs "End Date" (Basic Information) — two separate date concepts worth clarifying before replica implementation.
