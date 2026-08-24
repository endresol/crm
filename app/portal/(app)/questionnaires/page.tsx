import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { listQuestionnairesForContact } from "@/features/questionnaires/service";
import { questionnaireProgress } from "@/features/questionnaires/constants";
import {
  QUESTIONNAIRE_STATUS_BADGE_VARIANT,
  QUESTIONNAIRE_STATUS_LABELS,
} from "@/features/questionnaires/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PortalQuestionnairesPage() {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const questionnaires = await listQuestionnairesForContact(contact.workspaceId, contact.clientId);

  return (
    <>
      <Topbar title="Questionnaires" subtitle="Forms we've asked you to fill out." />
      <div className={styles.content}>
        <Table>
          <thead>
            <tr>
              <th>Questionnaire</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.length === 0 ? (
              <TableEmptyState colSpan={3} title="No questionnaires yet" />
            ) : (
              questionnaires.map((questionnaire) => {
                const { answered, total } = questionnaireProgress(questionnaire.questions);
                return (
                  <TableRow key={questionnaire.id}>
                    <td>
                      <Link
                        href={`/portal/questionnaires/${questionnaire.id}`}
                        style={{ fontWeight: 600, color: "var(--color-text)" }}
                      >
                        {questionnaire.name}
                      </Link>
                    </td>
                    <td>
                      {total === 0 ? "—" : `${answered} of ${total} answered`}
                    </td>
                    <td>
                      <Badge variant={QUESTIONNAIRE_STATUS_BADGE_VARIANT[questionnaire.status]}>
                        {QUESTIONNAIRE_STATUS_LABELS[questionnaire.status]}
                      </Badge>
                    </td>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
