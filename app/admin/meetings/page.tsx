import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listSchedules, listMeetings } from "@/features/meetings/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddScheduleButton } from "@/features/meetings/components/AddScheduleButton";
import { MeetingsTable } from "@/features/meetings/components/MeetingsTable";
import styles from "@/components/layout/AdminShell.module.css";

export default async function MeetingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [schedules, meetings] = await Promise.all([
    listSchedules(user.workspaceId),
    listMeetings(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title="Meetings"
        subtitle="Manage your booking schedules and see who's booked in."
        actions={<AddScheduleButton />}
      />
      <div className={styles.content}>
        <Card>
          <CardHeader
            title="Schedules"
            subtitle={`${schedules.length} ${schedules.length === 1 ? "schedule" : "schedules"}`}
          />
          {schedules.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              Create a schedule so clients can book time with you.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {schedules.map((schedule) => (
                <Link
                  key={schedule.id}
                  href={`/admin/meetings/${schedule.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{schedule.name}</span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", marginLeft: "var(--space-3)" }}>
                      {schedule.durationMinutes} min · {schedule._count.meetings}{" "}
                      {schedule._count.meetings === 1 ? "meeting" : "meetings"} booked
                    </span>
                  </div>
                  <Badge variant={schedule.active ? "success" : "neutral"}>
                    {schedule.active ? "Active" : "Inactive"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader title="Upcoming meetings" subtitle={`${meetings.length} total`} />
            <MeetingsTable
              meetings={meetings}
              dateFormat={user.workspaceDateFormat}
              timeZone={user.workspaceTimezone}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
