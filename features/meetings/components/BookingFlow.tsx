"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SlotPicker } from "./SlotPicker";
import { getAvailableSlotsAction } from "../public-actions";

type Schedule = { id: string; name: string; description: string | null; durationMinutes: number };
type BookState = { error?: string; success?: boolean };

/**
 * The shared "pick a meeting type → pick a time → confirm" flow, used by
 * both the Client Portal (roadmap #19's primary target) and the public
 * /book/[slug] embed — they differ only in which `bookAction` gets called
 * (attributed to a Contact vs. anonymous) and what happens after: the portal
 * action redirects to "your meetings" on success, so `bookState.success`
 * never renders here for it; the public action has no such page to redirect
 * to, so it returns success and this component shows `successMessage` inline
 * instead.
 */
export function BookingFlow({
  schedules,
  timeZone,
  bookAction,
  defaultName,
  defaultEmail,
  successMessage = "You're booked — we'll see you then.",
}: {
  schedules: Schedule[];
  timeZone: string;
  bookAction: (scheduleId: string, prevState: BookState, formData: FormData) => Promise<BookState>;
  defaultName?: string;
  defaultEmail?: string;
  successMessage?: string;
}) {
  const [scheduleId, setScheduleId] = useState<string | null>(
    schedules.length === 1 ? (schedules[0]?.id ?? null) : null,
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, startSlotsTransition] = useTransition();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduleId) return;
    startSlotsTransition(async () => {
      setSlots([]);
      setSelectedSlot(null);
      const result = await getAvailableSlotsAction(scheduleId);
      setSlots(result.slots);
    });
  }, [scheduleId]);

  const boundBookAction = scheduleId
    ? bookAction.bind(null, scheduleId)
    : async (state: BookState) => state;
  const [bookState, formAction, pending] = useActionState(boundBookAction, {});

  const schedule = schedules.find((s) => s.id === scheduleId);

  if (bookState.success) {
    return (
      <Card>
        <p style={{ fontSize: "var(--text-md)", fontWeight: 600 }}>{successMessage}</p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {schedules.length > 1 && !scheduleId && (
        <Card>
          <CardHeader title="Choose a meeting type" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {schedules.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScheduleId(s.id)}
                style={{
                  textAlign: "left",
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  {s.durationMinutes} min{s.description ? ` — ${s.description}` : ""}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {scheduleId && schedule && (
        <Card>
          <CardHeader
            title={schedule.name}
            subtitle={`${schedule.durationMinutes} minutes · times shown in ${timeZone}`}
            action={
              schedules.length > 1 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setScheduleId(null)}>
                  Change
                </Button>
              ) : undefined
            }
          />

          {slotsLoading ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              Loading available times…
            </p>
          ) : slots.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              No times available right now.
            </p>
          ) : selectedSlot ? (
            // Collapse the (potentially many-weeks-long) slot list once one's
            // picked — with a schedule bookable 30+ days out, leaving the
            // full list expanded would bury the confirm form at the bottom
            // of dozens of day-groups below whatever the user just clicked.
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {new Intl.DateTimeFormat("en-US", {
                  timeZone,
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(selectedSlot))}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>
                Change time
              </Button>
            </div>
          ) : (
            <SlotPicker slots={slots} timeZone={timeZone} selected={selectedSlot} onSelect={setSelectedSlot} />
          )}

          {selectedSlot && (
            <form
              action={formAction}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
                marginTop: "var(--space-5)",
              }}
            >
              <input type="hidden" name="startAt" value={selectedSlot} />
              {bookState.error && (
                <div
                  style={{
                    background: "var(--color-danger-soft)",
                    color: "var(--color-danger)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3) var(--space-4)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {bookState.error}
                </div>
              )}
              <Input name="bookerName" label="Your name" defaultValue={defaultName} required />
              <Input name="bookerEmail" type="email" label="Your email" defaultValue={defaultEmail} required />
              <Textarea name="notes" label="Anything we should know?" optional rows={3} />
              <Button type="submit" disabled={pending}>
                {pending ? "Booking…" : "Confirm meeting"}
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
