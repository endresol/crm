# 04 — Calendar

Source: `Calendar` nav item → `/admin/scheduler` (yes — the route is `/admin/scheduler`, not `/admin/calendar`)

## Purpose
Combines two related but distinct sub-features under one nav item: (1) a personal/team calendar view of events, and (2) a Calendly-style public meeting-booking system ("Meetings").

## Page structure
Header: "Calendar Dashboard" + "Manage calendar and meetings efficiently." Two tabs: **Calendar** | **Meetings**.

### Calendar tab
- **Google Calendar** connector chip: shows connection status ("Not Connected") + **Connect** button (OAuth integration — not tested, to avoid leaving the app).
- Month navigation (prev/next arrows) + label (e.g. "August 2026"), **Month view** dropdown (view switcher, other options not confirmed — likely Week/Day/List/Agenda).
- Action buttons: **Add event**, **Schedule meeting**.
- Standard Sun–Sat month grid, today highlighted.
- **Add event modal**: minimal — "What is this event about?" (text), Start Date & Time (time dropdown default 09:00 + date picker), End (time dropdown default 10:00 + date picker), **Save**. No attendees/location/description fields visible — this is a lightweight personal event, not a full meeting invite.

### Meetings tab (booking-page management, Calendly-style)
- Toolbar: **Filter**, **Sort By: Date**.
- **Booked meetings list**: cards showing the booker's avatar/initial, name, email, date/time/duration chips (e.g. "23 Dec", "13:00", "30 min"), and a **Cancel Meeting** action.
- Per-schedule header at top-right: "Schedule: [Schedule Name]" with an **edit (pencil)** icon and a **copy-link** icon (shareable public booking link, e.g. Calendly-style `/book/<schedule>` page — not directly observed but strongly implied by "Copy Meeting Scheduler Link").
- Empty/promo panel: "Build Your Schedule — You can create meeting schedules here and send them to clients! Easy peasy." + **Create Another Schedule** button.
- **Create/Edit Meeting Schedule** is a 3-step wizard modal ("1/3", "2/3", "3/3"):
  - Step 1: **Name of Schedule** (text, placeholder "E.g. 15 min Discovery Call") → Next.
  - Steps 2–3: not captured (the embedded widget for these steps repeatedly broke this session's browser-automation tooling — likely a third-party scheduling widget rendered via an isolated extension/iframe context). Based on the Calendly-style pattern and the booked-meeting data shown (30 min duration, specific time), steps 2–3 almost certainly cover: **availability/duration settings** (meeting length, available days/hours, buffer time) and **booking page details** (description, location/video-call type, confirmation message). Treat as a reasonable assumption to validate later, not a confirmed spec.
  - An existing schedule ("Discovery call") can be deleted via a trash icon at the top of the edit modal.

## Data model (inferred)
**CalendarEvent**: id, title, start_datetime, end_datetime, owner/user.
**MeetingSchedule**: id, name, duration, availability rules, booking-page slug/link, owner.
**Booking** (an instance of someone booking a MeetingSchedule): id, schedule_id (FK), booker_name, booker_email, date, time, duration, status (booked/cancelled).

## Open questions
- Full field set for Meeting Schedule wizard steps 2–3 (availability rules, buffer, location/video type, confirmation/notification settings) — needs a revisit, ideally opened once rather than via automated clicking (or opened manually by the user and screen-shared).
- Month view dropdown's other view options (Week/Day/List) not confirmed.
- Whether "Add event" syncs to Google Calendar once connected, or is purely internal until Connect is used.
