import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { listProjectsForClient } from "@/features/projects/service";
import { PROJECT_STATUS_BADGE_VARIANT, PROJECT_STATUS_LABELS } from "@/features/projects/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PortalProjectsPage() {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const projects = await listProjectsForClient(contact.workspaceId, contact.clientId);

  return (
    <>
      <Topbar title="Projects" subtitle={`Everything we're working on for ${contact.clientName}.`} />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <TableEmptyState colSpan={2} title="No projects yet" />
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <td style={{ fontWeight: 600 }}>{project.name}</td>
                  <td>
                    <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
