import { notFound } from "next/navigation";
import { getScheduleBySlug } from "@/features/meetings/service";
import { bookMeetingPublicAction } from "@/features/meetings/public-actions";
import { BookingFlow } from "@/features/meetings/components/BookingFlow";
import { WorkspaceTheme } from "@/components/layout/WorkspaceTheme";

// Deliberately outside both /admin and /portal — this is the public,
// unauthenticated page meant to be linked (or embedded via <iframe>) from
// the agency's own external website (roadmap #19's second target, after the
// Client Portal). No auth guard, no proxy.ts involvement: it's reachable on
// whichever host serves this app, same as the rest of a real Calendly-style
// booking link. Nothing here sets X-Frame-Options/frame-ancestors, so it's
// embeddable by default — see next.config.ts if that ever needs locking down
// to specific embedding origins.
export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const schedule = await getScheduleBySlug(slug);
  if (!schedule) notFound();

  return (
    <>
      <WorkspaceTheme
        colors={{
          backgroundColor: schedule.workspace.backgroundColor,
          accentColor: schedule.workspace.accentColor,
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          padding: "var(--space-8) var(--space-4)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            {schedule.workspace.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={schedule.workspace.logoUrl}
                alt={schedule.workspace.name}
                style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", objectFit: "contain" }}
              />
            ) : null}
            <span style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{schedule.workspace.name}</span>
          </div>

          <BookingFlow
            schedules={[schedule]}
            timeZone={schedule.workspace.timezone}
            bookAction={bookMeetingPublicAction}
          />
        </div>
      </div>
    </>
  );
}
