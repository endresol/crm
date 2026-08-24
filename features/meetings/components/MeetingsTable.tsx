"use client";

import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { MEETING_STATUS_BADGE_VARIANT, MEETING_STATUS_LABELS } from "../constants";
import { cancelMeetingAction } from "../actions";
import type { MeetingStatusValue } from "../constants";

type MeetingRow = {
  id: string;
  scheduleName: string;
  bookerName: string;
  bookerEmail: string;
  startAt: Date | string;
  status: MeetingStatusValue;
  client: { id: string; name: string } | null;
};

export function MeetingsTable({
  meetings,
  dateFormat,
  timeZone,
  showClient = true,
}: {
  meetings: MeetingRow[];
  dateFormat: string;
  timeZone: string;
  showClient?: boolean;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>When</th>
          <th>Meeting</th>
          <th>Booked by</th>
          {showClient && <th>Client</th>}
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {meetings.length === 0 ? (
          <TableEmptyState colSpan={showClient ? 6 : 5} title="No meetings yet" />
        ) : (
          meetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <td>{formatDateTime(meeting.startAt, { pattern: dateFormat, timeZone })}</td>
              <td style={{ fontWeight: 600 }}>{meeting.scheduleName}</td>
              <td>
                <div>{meeting.bookerName}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
                  {meeting.bookerEmail}
                </div>
              </td>
              {showClient && <td>{meeting.client?.name ?? "—"}</td>}
              <td>
                <Badge variant={MEETING_STATUS_BADGE_VARIANT[meeting.status]}>
                  {MEETING_STATUS_LABELS[meeting.status]}
                </Badge>
              </td>
              <td>
                {meeting.status === "CONFIRMED" && (
                  <form action={cancelMeetingAction.bind(null, meeting.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </form>
                )}
              </td>
            </TableRow>
          ))
        )}
      </tbody>
    </Table>
  );
}
