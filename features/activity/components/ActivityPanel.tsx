"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ACTIVITY_ENTITY_TYPES, ACTIVITY_ENTITY_TYPE_LABELS } from "../constants";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityLog } from "@/generated/prisma/client";

/** The full /admin/activity feed, with a client-side entity-type filter —
 * same "filter what's already on the page" pattern as e.g. LeadsPanel,
 * rather than a searchParams round-trip. `entries` is already capped and
 * ordered by the server (see listActivity's `take`). */
export function ActivityPanel({ entries }: { entries: ActivityLog[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? entries : entries.filter((entry) => entry.entityType === filter)),
    [entries, filter],
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="ALL">All activity</option>
          {ACTIVITY_ENTITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {ACTIVITY_ENTITY_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </div>
      <Card>
        <ActivityFeed
          entries={filtered}
          emptyTitle={filter === "ALL" ? "No activity yet" : "Nothing here yet"}
          emptyDescription={
            filter === "ALL"
              ? "Actions across the workspace will show up here as they happen."
              : `No ${ACTIVITY_ENTITY_TYPE_LABELS[filter as keyof typeof ACTIVITY_ENTITY_TYPE_LABELS].toLowerCase()} activity yet.`
          }
        />
      </Card>
    </div>
  );
}
