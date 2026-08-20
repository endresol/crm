import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listSops } from "@/features/sops/service";
import { formatDate } from "@/lib/format";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { CreateSopButton } from "@/features/sops/components/CreateSopButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function SopsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sops = await listSops(user.workspaceId);

  return (
    <>
      <Topbar
        title="SOPs"
        subtitle="Create, view, edit and send SOPs."
        actions={<CreateSopButton />}
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {sops.length === 0 ? (
              <TableEmptyState
                colSpan={2}
                title="No SOPs yet"
                description="Create your first SOP to start building your knowledge base."
              />
            ) : (
              sops.map((sop) => (
                <TableRow key={sop.id}>
                  <td>
                    <Link
                      href={`/admin/sops/${sop.id}`}
                      style={{ fontWeight: 600, color: "var(--color-text)" }}
                    >
                      {sop.title}
                    </Link>
                  </td>
                  <td>{formatDate(sop.updatedAt, user.workspaceDateFormat)}</td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
