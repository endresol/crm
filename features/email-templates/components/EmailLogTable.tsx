import Link from "next/link";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";
import { ACTIVITY_ENTITY_TYPE_LABELS } from "@/features/activity/constants";
import { EMAIL_STATUS_BADGE_VARIANT, EMAIL_STATUS_LABELS } from "../constants";
import type { EmailLog, User } from "@/generated/prisma/client";

/** The Email Log page (roadmap #21) — the practical stand-in for "monitor
 * responses" in this pass: real inbound-reply tracking is deferred (see
 * docs/roadmap.md), so this is send *outcomes* only, failures included, not
 * a conversation view. */
export function EmailLogTable({
  entries,
  timezone,
  dateFormat,
}: {
  entries: (EmailLog & { sentByUser: Pick<User, "id" | "name"> | null })[];
  timezone: string;
  dateFormat: string;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>To</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Related record</th>
          <th>Sent by</th>
          <th>When</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <TableEmptyState
            colSpan={6}
            title="No emails sent yet"
            description="Emails sent from Invoices, Proposals, Contracts, Questionnaires, Meetings, and Client Portal invites will show up here."
          />
        ) : (
          entries.map((entry) => (
            <TableRow key={entry.id}>
              <td>{entry.contactEmail}</td>
              <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.subject}
              </td>
              <td>
                <Badge variant={EMAIL_STATUS_BADGE_VARIANT[entry.status]}>
                  {EMAIL_STATUS_LABELS[entry.status]}
                </Badge>
                {entry.status === "FAILED" && entry.errorMessage && (
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: 2 }}>
                    {entry.errorMessage}
                  </div>
                )}
              </td>
              <td>
                {entry.url ? (
                  <Link href={entry.url} style={{ color: "var(--color-primary-soft-text)", fontWeight: 600 }}>
                    {ACTIVITY_ENTITY_TYPE_LABELS[entry.entityType]} →
                  </Link>
                ) : (
                  ACTIVITY_ENTITY_TYPE_LABELS[entry.entityType]
                )}
              </td>
              <td>{entry.sentByUser?.name ?? "—"}</td>
              <td>{formatDateTime(entry.createdAt, { pattern: dateFormat, timeZone: timezone })}</td>
            </TableRow>
          ))
        )}
      </tbody>
    </Table>
  );
}
