import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { listProjects } from "@/features/projects/service";
import { listClients } from "@/features/clients/service";
import { PROJECT_STATUS_BADGE_VARIANT, PROJECT_STATUS_LABELS } from "@/features/projects/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AddProjectButton } from "@/features/projects/components/AddProjectButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [projects, clients] = await Promise.all([
    listProjects(user.workspaceId),
    listClients(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title="Projects"
        subtitle="View and manage your projects from here."
        actions={<AddProjectButton clients={clients} />}
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                title="No projects yet"
                description="Create a project to start organizing work for a client."
              />
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <td>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      style={{ fontWeight: 600, color: "var(--color-text)" }}
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/clients/${project.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {project.client.name}
                    </Link>
                  </td>
                  <td>
                    <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </td>
                  <td>{project.startDate ? formatDate(project.startDate) : "—"}</td>
                  <td>{project.endDate ? formatDate(project.endDate) : "—"}</td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
