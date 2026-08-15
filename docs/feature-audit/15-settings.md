# 15 — Settings

Source: `Settings` nav item → `/admin/settings` (hub page with cards, grouped into 3 sections)

## Hub layout (`Settings`)
- **Application Settings**: Account, General, White Label
- **Client Experience**: Client Portal (see 14-client-portal.md), Email Templates, Document Templates
- **Data & Integrations**: Connect, Objects

## Account (`/admin/settings/account`)
- **Profile**: avatar (Upload Image / Delete), Name, Email, **Role** (read-only display, e.g. "Master Admin" — confirms a role-based permission system), Update Profile button.
- **Security**: Old Password / New Password / Confirm New Password + Update Password button.

## General (`/admin/settings/general`) — 4 collapsible sections
1. **Workspace Information and Configs**
   - *Workspace Information*: Workspace Name (e.g. "Endre Solem's personal" — default workspace naming convention is "[User]'s personal"), Workspace ID (read-only, auto-generated), Industry Type (select), Company Size (select), Country/Region, Primary Language (default English), Timezone (default UTC), Default Currency (default "$ - US Dollar").
   - *Workspace Preferences*: Date Format (default MM/DD/YYYY), Time Format (12-hour/24-hour), Week Starts On (default Sunday), Fiscal Year Start Month (default January), Number Format (default "1,234.56 (US)").
   - *Contact Information*: Company Address, Website URL, Phone Number (country-code selector), Support Email.
   - *Workspace Branding Configs*: Background Color (named preset, e.g. "Soft Rose"), Accent Color (hex picker, e.g. #732AFF) — "Background and accent styling used on **client-facing screens**" — ties directly into Client Portal appearance.
   - Cancel / Save Changes footer.
2. **Manage Subscription**
   - Current Plan card: Plan Type ("Solo"), Seats (1), Billing ("$0.00/Yearly" on this account), Status ("Active"), **Change Plan** button, **Danger Zone** — Cancel subscription ("Canceling will remove all access to your account.").
   - Payment Method card: masked card (brand icon + last 4 digits).
3. **Workspace Quota** — **per-module usage limits tied to the subscription plan**, each shown as "X of Y used" + % bar + "N available". Observed limits on the **Solo** plan: **Clients 50, Contacts 100, Deals 100, Projects 10, Proposals 100, Contracts 100, Invoices 100, Questionnaire 30, Templates 10.** This is a core SaaS-metering mechanism worth replicating (plan tiers gate record counts per module, not just seats).
4. **Workspace Members**
   - Workspace Seats: "1 of 1 seats used" + Change Plan button.
   - Banner when on Solo: "Solo Plan Active — You're currently on a Solo plan which is limited to one user. Upgrade to a Team plan to collaborate with your team members." (confirms a **Team** plan tier exists for multi-user workspaces).
   - Member list: avatar, name ("You" badge for self), email, Status (Active), Role badge (e.g. "Master Admin"), "Joined [date]".

## White Label (`/admin/settings/white-label`)
- **Domain Settings** section is **gated behind an upgrade** ("Upgrade required to unlock domain settings").
- Upsell card: "White Label — Customise what your clients see with your own branding and a more professional client-facing experience." Callout: "Brand the client experience — Apply your own logo, colours, email identity, and portal domain without changing any existing workflow."
- Feature checklist: Remove "Made with ClientManager", Modify background and accent colours, Send updates from your own email, Use your company logo, Use your own client portal domain.
- **Upgrade** button (plan upsell CTA).

## Email Templates (`/admin/settings/emails`)
- "Customise the emails sent to your clients for proposals, contracts, invoices, and more. Changes apply to all future sends from your workspace."
- Organized by module, each a collapsible template list:
  - **Proposals** (1 template): Proposal Sent
  - **Contracts** (1 template): Contract Sent
  - **Invoices** (4 templates): Invoice Due Tomorrow, Invoice Due in 7 Days, Invoice Overdue, Invoice Sent — confirms **automated invoice reminder emails** (due-soon and overdue) are a built-in feature.
  - **Questionnaires** (present, not expanded in detail).
- Each template expands to: **Subject Line** (editable, with merge-field tokens like `{{workspace_name}}`, `{{proposal_title}}`), **Email Preview** (rendered with dummy sample data — banner/hero image, greeting, a data card e.g. "PROPOSAL: Q3 Marketing Proposal", CTA button e.g. "Review proposal →", sign-off), and an **Edit Template** button (opens a fuller editor, not entered further).

## Document Templates (`/admin/templates`, linked from Settings but its own top-level route)
- Central template library with tabs: **Proposals**, **Contracts**, **Invoices**, **Questionnaires**.
- Each tab: header, **+ Create** button, search box, and a template list (empty state: "No Templates Found — Please create a new template").
- This is the same template library surfaced inline when creating a Proposal/Contract/Invoice/Questionnaire from their respective modules (09–13) — centralizing management here.

## Connect (`/admin/settings/connect`) — Integrations
- **Workspace Integrations**: **Google** (calendar and email sync), **Outlook** (calendar and email sync) — both "Not Connected" in this account; ties into the Google Calendar "Connect" chip seen on the Calendar page (04-calendar.md).
- **Payment Integrations** (for accepting invoice payments from clients): **PayPal**, **Square**, **Authorize.net**, **Venmo** (via Braintree), **Stripe** ("Connect Stripe (Coming Soon)" — disabled/greyed, not yet available). Footer note: "More integrations coming soon. Stay tuned for updates!"
- All shown as "Not Connected" with a branded **Connect [Provider]** button each — no OAuth flow was initiated (would leave the app / require account credentials).

## Objects (`/admin/settings/objects`)
- **"Under Construction"** — "Custom data objects and data modeling will be available here soon." Status: **Coming Soon**. Confirms a planned-but-unbuilt custom-fields/custom-objects system (like HubSpot/Salesforce custom objects) — low priority for an MVP replica, but worth keeping the data model extensible for it later.

## Data model (inferred)
**Workspace**: id, name, industry, company_size, country, language, timezone, currency, date_format, time_format, week_start, fiscal_year_start_month, number_format, address, website, phone, support_email, background_color, accent_color, plan (Solo/Team/...), billing_cycle, seats.
**PlanQuota**: plan, module (clients/contacts/deals/projects/proposals/contracts/invoices/questionnaires/templates), limit.
**User**: id, name, email, avatar, role (Master Admin / ...), workspace_id, status, joined_at.
**EmailTemplate**: id, module (proposal/contract/invoice/questionnaire), key (e.g. "invoice_overdue"), subject, body (with merge-field support).
**Integration**: id, workspace_id, provider (google/outlook/paypal/square/authorize_net/venmo/stripe), status (connected/not_connected), credentials (encrypted, not our concern for the doc).

## Open questions
- Full Role list beyond "Master Admin" (Team plan presumably introduces additional roles — Member, Viewer, etc.).
- Exact plan tiers beyond Solo/Team (pricing, seat counts, quota differences) — would need the pricing/upgrade page, not reached.
- Document Templates builder UI (same "Build From Scratch"/"Use Default Template" pattern as inline creation, not reopened here).
- Whether Workspace Quota limits are hard blocks (reject creation past limit) or soft warnings.
