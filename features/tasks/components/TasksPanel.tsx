"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "../actions";
import { TaskForm } from "./TaskForm";
import { TaskBoard } from "./TaskBoard";
import { GanttChart } from "./GanttChart";
import styles from "./TasksPanel.module.css";
import type { Task } from "@/generated/prisma/client";

type View = "board" | "gantt";

export function TasksPanel({
  tasks,
  milestones,
  projectId,
  projectStartDate,
  projectEndDate,
  dateFormat,
}: {
  tasks: Task[];
  milestones: { id: string; name: string }[];
  projectId: string;
  projectStartDate?: Date | string | null;
  projectEndDate?: Date | string | null;
  dateFormat: string;
}) {
  const [view, setView] = useState<View>("board");
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={[styles.tab, view === "board" ? styles.tabActive : ""].join(" ")}
            onClick={() => setView("board")}
          >
            Board
          </button>
          <button
            type="button"
            className={[styles.tab, view === "gantt" ? styles.tabActive : ""].join(" ")}
            onClick={() => setView("gantt")}
          >
            Gantt
          </button>
        </div>
        <Button onClick={() => setEditing("new")}>
          <PlusIcon width={16} height={16} />
          New task
        </Button>
      </div>

      {view === "board" ? (
        <TaskBoard tasks={tasks} onTaskClick={setEditing} dateFormat={dateFormat} />
      ) : (
        <GanttChart
          tasks={tasks}
          milestones={milestones}
          projectStartDate={projectStartDate}
          projectEndDate={projectEndDate}
          onTaskClick={(task) => setEditing(tasks.find((t) => t.id === task.id) ?? null)}
        />
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New task" : "Edit task"}
      >
        {editing === "new" ? (
          <TaskForm
            action={createTaskAction.bind(null, projectId)}
            milestones={milestones}
            submitLabel="Create task"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <TaskForm
            action={updateTaskAction.bind(null, editing.id, projectId)}
            milestones={milestones}
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
