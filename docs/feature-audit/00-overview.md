# 00 — Overview: Global Layout, Navigation & Dashboard

Source: `https://app.clientmanager.io/admin/dashboard`

## Global layout

- **Left sidebar** (collapsible via hamburger icon top-left next to "ClientManager" logo), organized into labeled sections:
  - **OVERVIEW**: Dashboard
  - **ENGAGE**: Clients, Contacts, Deals, Calendar, Leads, Products
  - **PROJECT MANAGEMENT**: Projects & Tasks, Time Tracking
  - **DOCUMENTS**: Contracts, Proposals, Invoices, SOPs, Questionnaires
  - **SETTINGS**: Client Portal, Settings
  - Each section header looks collapsible (chevron icon) — likely can be expanded/collapsed independently.
  - Sidebar items have icons + label; active item highlighted (purple/indigo).
- **Topbar** (present on every admin page): page title (H1) + one-line subtitle/description under it (e.g. "A bird's eye view of what's cooking...."), and on the right a row of icon buttons + primary action:
  - **Info/reminder bell (circle-i icon)** → opens "Your Reminders" popover. Empty state: "No new reminders. It's a good time to relax... Or is it?"
  - **Notification bell icon** (has small unread-dot badge) → opens "Your Notifications" popover with "Mark all as read" link. Example entry seen: "Notification — Reminder: 'Audit the FDG website' is ... — 4 months ago" (avatar circle with "N").
  - **Goals/medal icon** → opens "Your Goals" popover with "Create new goal" link. Empty state: "No new goals. It's a good time to set some targets!"
  - **Play button (circle)** → opens a **"Log Time"**-style quick modal: "HOURS: FOR WHO AND FOR WHAT?" with cascading selects: **Client** → **Project** → **Select a Task** (task select disabled until project chosen). This is a global quick time-tracking entry point.
  - **"NEW ▾" button** (primary/filled) → dropdown "NEW ACTION" with quick-create shortcuts (icon + label each), scrollable list, at least:
    - New Client
    - New Contact
    - New Deal
    - New Project
    - New Lead
    - New Meeting Schedule
    - (list continues below the fold — likely also New Invoice/Proposal/Contract/Task; not fully confirmed, revisit if time)
  - **User avatar** (top-right) → dropdown with **Settings** and **Sign Out**. Tooltip on hover reads "Profile".

## Dashboard page (`/admin/dashboard`)

Three tabs under the page header: **Overview** | **Calendar** | **Todo**

### Overview tab
- Stat cards row: **All Tasks** (big number, small "+0" delta badge, lightning icon), **Your Tasks** (same pattern), **Upcoming Tasks** (has a **Monthly** period dropdown filter).
- **Invoices Overview** panel (large card, left) with a **Monthly** period dropdown — chart/graph area (empty in this account, no data yet).
- Right-side widget cluster:
  - User profile photo card (decorative).
  - 4 small stat tiles in a 2×2 grid: **Clients** (count, people icon), **Projects** (count, cube icon), **Incomplete Tasks** (count, lightning icon), **Monthly Hours** (count, clock icon).
  - **Tracked Time (in Hours)** card with **All Time** period dropdown and a **View All** button (links out to full time-tracking report).

### Calendar tab
- Embedded calendar (month view by default) inside the dashboard.
- Header row: **Google Calendar** connector chip showing **"Not Connected"** status + **Connect** button (third-party calendar sync/integration).
- Month navigation (prev/next arrows) + month/year label (e.g. "August 2026").
- View switcher dropdown: **Month view** (likely also Week/Day/List — not yet confirmed).
- Action buttons: **Add event**, **Schedule meeting** (distinct flows — one is a simple calendar event, the other likely a scheduling-link/booking flow).
- Standard 7-column (Sun–Sat) month grid, today's date highlighted.

### Todo tab
- Simple flat todo list, separate from the "Tasks" entity used elsewhere (Projects & Tasks module) — appears to be personal/admin-user scoped quick todos rather than client/project-linked tasks.
- Header: "All Todo Items" + **+ Add Todo Item** button (top-right and also repeated as an empty-state CTA).
- Empty state: "No todo items found!" with centered **+ Add Todo Item** button.

## Notes / open questions
- Need to scroll the "NEW" dropdown further to confirm the full quick-create action list (Invoice/Proposal/Contract/Task quick-create may exist below the visible items).
- Calendar "Schedule meeting" vs "Add event" distinction not yet explored — revisit in 04-calendar.md.
- Sidebar section collapse/expand behavior not yet tested.
- Gamification surface (Goals, and possibly badges/achievements tied to the medal icon) is a lightweight feature — worth a cheap version in the replica but low priority.
