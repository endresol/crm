import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getProject } from "@/features/projects/service";
import { PROJECT_STATUS_BADGE_VARIANT, PROJECT_STATUS_LABELS } from "@/features/projects/constants";
import { listTasksForProject } from "@/features/tasks/service";
import { listMilestonesForProject } from "@/features/milestones/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditProjectButton } from "@/features/projects/components/EditProjectButton";
import { DeleteProjectButton } from "@/features/projects/components/DeleteProjectButton";
import { TasksPanel } from "@/features/tasks/components/TasksPanel";
import { MilestonesSection } from "@/features/milestones/components/MilestonesSection";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const project = await getProject(user.workspaceId, id);
  if (!project) notFound();

  const [tasks, milestones] = await Promise.all([
    listTasksForProject(user.workspaceId, project.id),
    listMilestonesForProject(user.workspaceId, project.id),
  ]);

  return (
    <>
      <Topbar
        title={project.name}
        subtitle="Project details"
        actions={
          <>
            <EditProjectButton project={project} />
            <DeleteProjectButton projectId={project.id} clientId={project.clientId} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/projects"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to projects
          </Link>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-6)",
            }}
          >
            <div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{project.name}</div>
              <Link
                href={`/admin/clients/${project.client.id}`}
                style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}
              >
                {project.client.name}
              </Link>
            </div>
            <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>

          {project.description && (
            <p style={{ marginBottom: "var(--space-5)", color: "var(--color-text)" }}>
              {project.description}
            </p>
          )}

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-5)",
            }}
          >
            <Field
              label="Start date"
              value={project.startDate ? formatDate(project.startDate) : undefined}
            />
            <Field
              label="End date"
              value={project.endDate ? formatDate(project.endDate) : undefined}
            />
          </dl>
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <MilestonesSection milestones={milestones} projectId={project.id} />
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader title="Tasks" subtitle={`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`} />
            <TasksPanel
              tasks={tasks}
              milestones={milestones}
              projectId={project.id}
              projectStartDate={project.startDate}
              projectEndDate={project.endDate}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt
        style={{
          fontSize: "var(--text-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-text-faint)",
          fontWeight: 600,
          marginBottom: "var(--space-1)",
        }}
      >
        {label}
      </dt>
      <dd style={{ fontSize: "var(--text-md)" }}>{value || "—"}</dd>
    </div>
  );
}
