import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getSchedule, listMeetingsForSchedule } from "@/features/meetings/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditScheduleButton } from "@/features/meetings/components/EditScheduleButton";
import { DeleteScheduleButton } from "@/features/meetings/components/DeleteScheduleButton";
import { AvailabilityRulesEditor } from "@/features/meetings/components/AvailabilityRulesEditor";
import { CopyLinkButton } from "@/features/meetings/components/CopyLinkButton";
import { MeetingsTable } from "@/features/meetings/components/MeetingsTable";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const schedule = await getSchedule(user.workspaceId, id);
  if (!schedule) notFound();

  const meetings = await listMeetingsForSchedule(user.workspaceId, schedule.id);

  return (
    <>
      <Topbar
        title={schedule.name}
        subtitle="Schedule details"
        actions={
          <>
            <EditScheduleButton schedule={schedule} />
            <DeleteScheduleButton scheduleId={schedule.id} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/meetings"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to meetings
          </Link>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            <Badge variant={schedule.active ? "success" : "neutral"}>
              {schedule.active ? "Active" : "Inactive"}
            </Badge>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              {schedule.durationMinutes} minutes · {schedule.bufferMinutes}min buffer ·{" "}
              {schedule.minNoticeHours}h notice · bookable {schedule.maxAdvanceDays} days out
            </span>
          </div>
          {schedule.description && (
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-5)" }}>
              {schedule.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <code
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
                fontSize: "var(--text-sm)",
              }}
            >
              /book/{schedule.slug}
            </code>
            <CopyLinkButton path={`/book/${schedule.slug}`} />
            <Link href={`/book/${schedule.slug}`} target="_blank" style={{ fontSize: "var(--text-sm)" }}>
              Open ↗
            </Link>
          </div>

          <AvailabilityRulesEditor
            scheduleId={schedule.id}
            initialRules={schedule.availabilityRules}
            timezone={user.workspaceTimezone}
          />
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader title="Booked meetings" subtitle={`${meetings.length} total`} />
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
