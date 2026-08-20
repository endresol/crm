import { formatDate } from "@/lib/format";
import { TASK_STATUSES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "../constants";
import styles from "./TaskBoard.module.css";
import type { Task } from "@/generated/prisma/client";

export function TaskBoard({
  tasks,
  onTaskClick,
  dateFormat,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  dateFormat: string;
}) {
  const byStatus = TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));

  return (
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
                onClick={() => onTaskClick(task)}
              >
                <div className={styles.cardTitle}>{task.title}</div>
                {task.dueDate && (
                  <div className={styles.cardDue}>Due {formatDate(task.dueDate, dateFormat)}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
