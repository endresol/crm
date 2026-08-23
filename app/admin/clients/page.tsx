import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listClients } from "@/features/clients/service";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { AddClientButton } from "@/features/clients/components/AddClientButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clients = await listClients(user.workspaceId);

  return (
    <>
      <Topbar
        title="Clients"
        subtitle="View and manage your clients from here."
        actions={<AddClientButton />}
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Website</th>
              <th>Industry</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <TableEmptyState
                colSpan={4}
                title="No clients yet"
                description="Add your first client to start tracking work and time for them."
              />
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <td>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      <Avatar name={client.name} imageUrl={client.logoUrl} size="sm" />
                      {client.name}
                    </Link>
                  </td>
                  <td>{client.email || "—"}</td>
                  <td>{client.website || "—"}</td>
                  <td>{client.industry || "—"}</td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
