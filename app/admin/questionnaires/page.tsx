import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listQuestionnaires } from "@/features/questionnaires/service";
import { listClients } from "@/features/clients/service";
import { listContacts } from "@/features/contacts/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import {
  QUESTIONNAIRE_STATUS_BADGE_VARIANT,
  QUESTIONNAIRE_STATUS_LABELS,
} from "@/features/questionnaires/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AddQuestionnaireButton } from "@/features/questionnaires/components/AddQuestionnaireButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function QuestionnairesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [questionnaires, clients, contacts, templates] = await Promise.all([
    listQuestionnaires(user.workspaceId),
    listClients(user.workspaceId),
    listContacts(user.workspaceId),
    listTemplatesByType(user.workspaceId, "QUESTIONNAIRE"),
  ]);

  return (
    <>
      <Topbar
        title="Questionnaires"
        subtitle="View and manage all your questionnaires from here."
        actions={
          <AddQuestionnaireButton
            clients={clients}
            contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
            templates={templates}
          />
        }
      />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Questionnaire</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.length === 0 ? (
              <TableEmptyState
                colSpan={4}
                title="No questionnaires found"
                description="Get started by creating your first questionnaire to collect information."
              />
            ) : (
              questionnaires.map((questionnaire) => (
                <TableRow key={questionnaire.id}>
                  <td>
                    <Link
                      href={`/admin/questionnaires/${questionnaire.id}`}
                      style={{ fontWeight: 600, color: "var(--color-text)" }}
                    >
                      {questionnaire.name}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/clients/${questionnaire.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {questionnaire.client.name}
                    </Link>
                  </td>
                  <td>{questionnaire.contact?.fullName ?? "—"}</td>
                  <td>
                    <Badge variant={QUESTIONNAIRE_STATUS_BADGE_VARIANT[questionnaire.status]}>
                      {QUESTIONNAIRE_STATUS_LABELS[questionnaire.status]}
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
