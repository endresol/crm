"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import styles from "./Sidebar.module.css";
import { Avatar } from "@/components/ui/Avatar";
import {
  BriefcaseIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  ContactIcon,
  ContractIcon,
  DealIcon,
  DocumentIcon,
  GridIcon,
  InvoiceIcon,
  LeadIcon,
  LogOutIcon,
  PeopleIcon,
  ProposalIcon,
  SettingsIcon,
  TagIcon,
  TeamIcon,
  TemplateIcon,
} from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: (p) => <GridIcon {...p} /> },
      { href: "/admin/team", label: "Team", icon: (p) => <TeamIcon {...p} /> },
      { href: "/admin/settings", label: "Settings", icon: (p) => <SettingsIcon {...p} /> },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/clients", label: "Clients", icon: (p) => <PeopleIcon {...p} /> },
      { href: "/admin/contacts", label: "Contacts", icon: (p) => <ContactIcon {...p} /> },
      { href: "/admin/deals", label: "Deals", icon: (p) => <DealIcon {...p} /> },
      { href: "/admin/leads", label: "Leads", icon: (p) => <LeadIcon {...p} /> },
    ],
  },
  {
    label: "Delivery",
    items: [
      { href: "/admin/projects", label: "Projects", icon: (p) => <BriefcaseIcon {...p} /> },
      { href: "/admin/time-tracking", label: "Time Tracking", icon: (p) => <ClockIcon {...p} /> },
      { href: "/admin/sops", label: "SOPs", icon: (p) => <DocumentIcon {...p} /> },
      { href: "/admin/calendar", label: "Calendar", icon: (p) => <CalendarIcon {...p} /> },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/admin/products", label: "Products", icon: (p) => <TagIcon {...p} /> },
      { href: "/admin/invoices", label: "Invoices", icon: (p) => <InvoiceIcon {...p} /> },
      { href: "/admin/proposals", label: "Proposals", icon: (p) => <ProposalIcon {...p} /> },
      { href: "/admin/contracts", label: "Contracts", icon: (p) => <ContractIcon {...p} /> },
      { href: "/admin/templates", label: "Templates", icon: (p) => <TemplateIcon {...p} /> },
    ],
  },
];

export function Sidebar({
  workspaceName,
  workspaceLogoUrl,
  userName,
  userEmail,
  userAvatarUrl,
  onLogout,
}: {
  workspaceName: string;
  workspaceLogoUrl?: string | null;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string | null;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();
  // Manually-collapsed group labels. Plain component state, not persisted —
  // Sidebar stays mounted across client-side nav within /admin (it lives in
  // the shared layout), so a choice survives normal browsing; it only resets
  // on a hard reload. Persisting to localStorage would need a client-only
  // effect to avoid a hydration mismatch (the server has no localStorage to
  // read), which felt like a lot of machinery for "let me tidy the nav" —
  // easy to add later if losing the state on reload turns out to matter.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  function toggleGroup(label: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        {workspaceLogoUrl ? (
          // Plain <img> rather than next/image — see the note in components/ui/Avatar.tsx.
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.logoImage} src={workspaceLogoUrl} alt={workspaceName} />
        ) : (
          <span className={styles.logoMark}>CM</span>
        )}
        <span className={styles.logoText}>{workspaceName}</span>
      </div>

      {NAV_GROUPS.map((group) => {
        const hasActiveItem = group.items.some((item) => pathname.startsWith(item.href));
        // A collapsed group still opens for the page you're actually on — a
        // link into it (e.g. from search, or a Client's linked Invoice)
        // shouldn't leave you unable to see where you landed.
        const expanded = !collapsed.has(group.label) || hasActiveItem;

        return (
          <div key={group.label}>
            <button
              type="button"
              className={styles.groupLabel}
              onClick={() => toggleGroup(group.label)}
              aria-expanded={expanded}
            >
              {group.label}
              <ChevronDownIcon
                className={[styles.groupChevron, expanded ? styles.groupChevronOpen : ""].join(" ")}
                width={14}
                height={14}
              />
            </button>
            {expanded && (
              <nav className={styles.nav}>
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[styles.navItem, active ? styles.navItemActive : ""].join(" ")}
                    >
                      <span className={styles.navIcon}>{item.icon({})}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        );
      })}

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <Link href="/admin/profile" className={styles.profileLink}>
          <Avatar name={userName} imageUrl={userAvatarUrl} size="sm" />
          <span className={styles.profileText}>
            <span className={styles.profileName}>{userName}</span>
            <span className={styles.profileEmail}>{userEmail}</span>
          </span>
        </Link>
        <form action={onLogout}>
          <button type="submit" className={styles.navItem} style={{ width: "100%" }}>
            <span className={styles.navIcon}>
              <LogOutIcon />
            </span>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
