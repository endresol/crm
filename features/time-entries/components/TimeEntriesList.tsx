import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { formatDate } from "@/lib/format";
import { DeleteTimeEntryButton } from "./DeleteTimeEntryButton";
import { formatMinutes } from "../service";
import type { TimeEntry } from "@/generated/prisma/client";

type EntryWithContext = TimeEntry & {
  user: { name: string };
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
};

export function TimeEntriesList({
  entries,
  hideProject = false,
  dateFormat,
}: {
  entries: EntryWithContext[];
  /** Omit the Project column when every entry is already scoped to one project (e.g. on a Project's own page). */
  hideProject?: boolean;
  dateFormat: string;
}) {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const columnCount = hideProject ? 7 : 8;

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
            {!hideProject && <th>Project</th>}
            <th>Task</th>
            <th>Logged by</th>
            <th>Duration</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <TableEmptyState colSpan={columnCount} title="No time logged yet" />
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <td>{formatDate(entry.date, dateFormat)}</td>
                <td>{entry.description || "—"}</td>
                {!hideProject && <td>{entry.project?.name ?? "—"}</td>}
                <td>{entry.task?.title ?? "—"}</td>
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
                  <DeleteTimeEntryButton
                    entryId={entry.id}
                    clientId={entry.clientId}
                    projectId={entry.projectId ?? undefined}
                  />
                </td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  );
}
