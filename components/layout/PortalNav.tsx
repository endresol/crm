"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, BriefcaseIcon, MeetingIcon, QuestionnaireIcon, LogOutIcon } from "@/components/ui/icons";
// Reuses Sidebar's CSS module rather than writing a parallel one — the nav
// item/logo/footer classes are already generic layout primitives, not
// admin-specific, and the Client Portal should look like the same product.
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Dashboard", icon: (p: { className?: string }) => <GridIcon {...p} /> },
  { href: "/portal/projects", label: "Projects", icon: (p: { className?: string }) => <BriefcaseIcon {...p} /> },
  {
    href: "/portal/questionnaires",
    label: "Questionnaires",
    icon: (p: { className?: string }) => <QuestionnaireIcon {...p} />,
  },
  {
    href: "/portal/meetings",
    label: "Meetings",
    icon: (p: { className?: string }) => <MeetingIcon {...p} />,
  },
];

export function PortalNav({
  workspaceName,
  workspaceLogoUrl,
  contactName,
  clientName,
  onLogout,
}: {
  workspaceName: string;
  workspaceLogoUrl?: string | null;
  contactName: string;
  clientName: string;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        {workspaceLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.logoImage} src={workspaceLogoUrl} alt={workspaceName} />
        ) : (
          <span className={styles.logoMark}>{workspaceName.slice(0, 2).toUpperCase()}</span>
        )}
        <span className={styles.logoText}>{workspaceName}</span>
      </div>

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
        <div className={styles.profileLink}>
          <span className={styles.profileText}>
            <span className={styles.profileName}>{contactName}</span>
            <span className={styles.profileEmail}>{clientName}</span>
          </span>
        </div>
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
