import Link from "next/link";
import { ActivityIcon } from "@/components/ui/icons";
import { formatRelativeTime } from "@/lib/format";
import styles from "./ActivityFeed.module.css";
import type { ActivityLog } from "@/generated/prisma/client";

/** Renders a flat, already-ordered list of ActivityLog rows — used on both
 * /admin/activity (the full feed) and the Dashboard's recent-activity card.
 * No per-entity filtering/grouping here; that's the caller's job (see
 * ActivityPanel for the entity-type filter). */
export function ActivityFeed({
  entries,
  emptyTitle = "No activity yet",
  emptyDescription = "Actions across the workspace will show up here as they happen.",
}: {
  entries: ActivityLog[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyTitle}>{emptyTitle}</div>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.id} className={styles.row}>
          <span className={styles.iconBubble}>
            <ActivityIcon width={16} height={16} />
          </span>
          <div className={styles.body}>
            <p className={styles.line}>
              <span className={styles.actor}>{entry.actorName}</span> {entry.action}
            </p>
            <div className={styles.meta}>
              <span>{formatRelativeTime(entry.createdAt)}</span>
              {entry.url && (
                <Link href={entry.url} className={styles.viewLink}>
                  View →
                </Link>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
