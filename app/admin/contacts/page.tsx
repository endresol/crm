import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listContacts } from "@/features/contacts/service";
import { listClients } from "@/features/clients/service";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { AddContactButton } from "@/features/contacts/components/AddContactButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function ContactsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [contacts, clients] = await Promise.all([
    listContacts(user.workspaceId),
    listClients(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title="Contacts"
        subtitle="View and manage your contacts from here."
        actions={<AddContactButton clients={clients} />}
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Title</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Client</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                title="No contacts yet"
                description="Add a contact to keep track of the people at your clients."
              />
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <td>
                    <Link
                      href={`/admin/contacts/${contact.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      <Avatar name={contact.fullName} imageUrl={contact.avatarUrl} size="sm" />
                      {contact.fullName}
                    </Link>
                  </td>
                  <td>{contact.jobTitle || "—"}</td>
                  <td>{contact.email || "—"}</td>
                  <td>{contact.phone || "—"}</td>
                  <td>
                    <Link
                      href={`/admin/clients/${contact.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {contact.client.name}
                    </Link>
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
