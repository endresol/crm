"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import styles from "./Sidebar.module.css";
import { ClockIcon, GridIcon, LogOutIcon, PeopleIcon } from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: (p) => <GridIcon {...p} /> },
  { href: "/admin/clients", label: "Clients", icon: (p) => <PeopleIcon {...p} /> },
  { href: "/admin/time-tracking", label: "Time Tracking", icon: (p) => <ClockIcon {...p} /> },
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

      <div className={styles.groupLabel}>Workspace</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
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
