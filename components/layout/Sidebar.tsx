"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import styles from "./Sidebar.module.css";
import {
  BriefcaseIcon,
  ClockIcon,
  ContactIcon,
  GridIcon,
  LogOutIcon,
  PeopleIcon,
  TagIcon,
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
      { href: "/admin/clients", label: "Clients", icon: (p) => <PeopleIcon {...p} /> },
      { href: "/admin/contacts", label: "Contacts", icon: (p) => <ContactIcon {...p} /> },
    ],
  },
  {
    label: "Delivery",
    items: [
      { href: "/admin/projects", label: "Projects", icon: (p) => <BriefcaseIcon {...p} /> },
      { href: "/admin/time-tracking", label: "Time Tracking", icon: (p) => <ClockIcon {...p} /> },
    ],
  },
  {
    label: "Money",
    items: [{ href: "/admin/products", label: "Products", icon: (p) => <TagIcon {...p} /> }],
  },
];

export function Sidebar({
  workspaceName,
  userName,
  onLogout,
}: {
  workspaceName: string;
  userName: string;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>CM</span>
        <span className={styles.logoText}>{workspaceName}</span>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className={styles.groupLabel}>{group.label}</div>
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
        </div>
      ))}

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <form action={onLogout}>
          <button type="submit" className={styles.navItem} style={{ width: "100%" }}>
            <span className={styles.navIcon}>
              <LogOutIcon />
            </span>
            Sign out ({userName})
          </button>
        </form>
      </div>
    </aside>
  );
}
