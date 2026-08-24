import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { listActiveSchedules, listMeetingsForContact } from "@/features/meetings/service";
import { bookMeetingPortalAction, cancelMeetingPortalAction } from "@/features/meetings/portal-actions";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { MEETING_STATUS_BADGE_VARIANT, MEETING_STATUS_LABELS } from "@/features/meetings/constants";
import { BookingFlow } from "@/features/meetings/components/BookingFlow";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PortalMeetingsPage() {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const [schedules, meetings] = await Promise.all([
    listActiveSchedules(contact.workspaceId),
    listMeetingsForContact(contact.workspaceId, contact.id),
  ]);

  return (
    <>
      <Topbar title="Meetings" subtitle="Request time, or see what's already on the books." />
      <div className={styles.content}>
        <Card>
          <CardHeader title="Your meetings" />
          {meetings.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              Nothing booked yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{meeting.scheduleName}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                      {formatDateTime(meeting.startAt, {
                        pattern: contact.workspaceDateFormat,
                        timeZone: contact.workspaceTimezone,
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <Badge variant={MEETING_STATUS_BADGE_VARIANT[meeting.status]}>
                      {MEETING_STATUS_LABELS[meeting.status]}
                    </Badge>
                    {meeting.status === "CONFIRMED" && new Date(meeting.startAt) > new Date() && (
                      <form action={cancelMeetingPortalAction.bind(null, meeting.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Cancel
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <CardHeader title="Request a meeting" />
          {schedules.length === 0 ? (
            <Card>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No meeting types are available to book right now.
              </p>
            </Card>
          ) : (
            <BookingFlow
              schedules={schedules}
              timeZone={contact.workspaceTimezone}
              bookAction={bookMeetingPortalAction}
              defaultName={contact.fullName}
              defaultEmail={contact.email ?? ""}
            />
          )}
        </div>
      </div>
    </>
  );
}
