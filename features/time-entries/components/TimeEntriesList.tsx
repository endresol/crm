import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { formatDate } from "@/lib/format";
import { DeleteTimeEntryButton } from "./DeleteTimeEntryButton";
import { formatMinutes } from "../service";
import type { TimeEntry } from "@/generated/prisma/client";

export function TimeEntriesList({
  entries,
  clientId,
}: {
  entries: (TimeEntry & { user: { name: string } })[];
  clientId: string;
}) {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);

  return (
    <Card>
      <CardHeader
        title="Time Log"
        subtitle={`${entries.length} ${entries.length === 1 ? "entry" : "entries"} logged`}
        action={
          <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
            {formatMinutes(totalMinutes)}
          </span>
        }
      />
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Logged by</th>
            <th>Duration</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <TableEmptyState colSpan={6} title="No time logged yet" />
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <td>{formatDate(entry.date)}</td>
                <td>{entry.description || "—"}</td>
                <td>{entry.user.name}</td>
                <td>{formatMinutes(entry.minutes)}</td>
                <td>
                  {entry.billable ? (
                    <Badge variant="success">Billable</Badge>
                  ) : (
                    <Badge variant="neutral">Non-billable</Badge>
                  )}
                </td>
                <td>
                  <DeleteTimeEntryButton entryId={entry.id} clientId={clientId} />
                </td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  );
}
