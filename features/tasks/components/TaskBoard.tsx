"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { TASK_STATUSES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "../constants";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "../actions";
import { TaskForm } from "./TaskForm";
import styles from "./TaskBoard.module.css";
import type { Task } from "@/generated/prisma/client";

export function TaskBoard({ tasks, projectId }: { tasks: Task[]; projectId: string }) {
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  const byStatus = TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }}>
        <Button onClick={() => setEditing("new")}>
          <PlusIcon width={16} height={16} />
          New task
        </Button>
      </div>

      <div className={styles.board}>
        {byStatus.map(({ status, tasks: columnTasks }) => (
          <div key={status} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.dot} style={{ background: TASK_STATUS_COLORS[status] }} />
              {TASK_STATUS_LABELS[status]}
              <span className={styles.count}>{columnTasks.length}</span>
            </div>
            <div className={styles.cards}>
              {columnTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setEditing(task)}
                >
                  <div className={styles.cardTitle}>{task.title}</div>
                  {task.dueDate && (
                    <div className={styles.cardDue}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New task" : "Edit task"}
      >
        {editing === "new" ? (
          <TaskForm
            action={createTaskAction.bind(null, projectId)}
            submitLabel="Create task"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <TaskForm
            action={updateTaskAction.bind(null, editing.id, projectId)}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteTaskAction(editing.id, projectId);
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
    </div>
  );
}
