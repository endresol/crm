"use client";

import { Button } from "@/components/ui/Button";

/** Groups ISO instants by local calendar day *in `timeZone`* — not the
 * viewer's own browser timezone. Times are shown in the schedule owner's
 * workspace timezone throughout this feature (see lib/timezone.ts's doc
 * comment on the trim), so grouping has to use that same zone or a slot
 * could land under the wrong day heading for someone viewing from elsewhere. */
export function SlotPicker({
  slots,
  timeZone,
  selected,
  onSelect,
}: {
  slots: string[];
  timeZone: string;
  selected: string | null;
  onSelect: (iso: string) => void;
}) {
  const groups = new Map<string, string[]>();
  for (const iso of slots) {
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(iso);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {[...groups.entries()].map(([day, times]) => (
        <div key={day}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
            {day}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {times.map((iso) => (
              <Button
                key={iso}
                type="button"
                variant={selected === iso ? "primary" : "secondary"}
                size="sm"
                onClick={() => onSelect(iso)}
              >
                {new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(
                  new Date(iso),
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
