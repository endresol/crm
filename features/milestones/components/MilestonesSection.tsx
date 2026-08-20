"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { createMilestoneAction, deleteMilestoneAction, updateMilestoneAction } from "../actions";
import { MilestoneForm } from "./MilestoneForm";
import styles from "./MilestonesSection.module.css";

export type MilestoneWithProgress = {
  id: string;
  name: string;
  dueDate: Date | string | null;
  taskCount: number;
  doneCount: number;
};

export function MilestonesSection({
  milestones,
  projectId,
  dateFormat,
}: {
  milestones: MilestoneWithProgress[];
  projectId: string;
  dateFormat: string;
}) {
  const [editing, setEditing] = useState<MilestoneWithProgress | "new" | null>(null);

  return (
    <Card>
      <CardHeader
        title="Milestones"
        subtitle={`${milestones.length} ${milestones.length === 1 ? "milestone" : "milestones"}`}
        action={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon width={16} height={16} />
            New milestone
          </Button>
        }
      />

      {milestones.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
          No milestones yet. Group tasks around a target date to track progress.
        </p>
      ) : (
        <div className={styles.list}>
          {milestones.map((milestone) => {
            const pct =
              milestone.taskCount === 0
                ? 0
                : Math.round((milestone.doneCount / milestone.taskCount) * 100);
            return (
              <button
                key={milestone.id}
                type="button"
                className={styles.row}
                onClick={() => setEditing(milestone)}
              >
                <div>
                  <div className={styles.name}>{milestone.name}</div>
                  <div className={styles.due}>
                    {milestone.dueDate ? `Due ${formatDate(milestone.dueDate, dateFormat)}` : "No due date"}
                  </div>
                </div>
                <div className={styles.progressWrap}>
                  <span className={styles.progressLabel}>
                    {milestone.doneCount}/{milestone.taskCount} tasks
                  </span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New milestone" : "Edit milestone"}
      >
        {editing === "new" ? (
          <MilestoneForm
            action={createMilestoneAction.bind(null, projectId)}
            submitLabel="Create milestone"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <MilestoneForm
            action={updateMilestoneAction.bind(null, editing.id, projectId)}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteMilestoneAction(editing.id, projectId);
                  setEditing(null);
                }}
              >
                <Button type="submit" variant="danger" size="sm">
                  Delete
                </Button>
              </form>
            }
          />
        ) : null}
      </Drawer>
    </Card>
  );
}
