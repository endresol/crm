import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getQuestionnaire } from "@/features/questionnaires/service";
import { listContacts } from "@/features/contacts/service";
import { listTemplatesByType } from "@/features/document-templates/service";
import {
  QUESTIONNAIRE_STATUS_BADGE_VARIANT,
  QUESTIONNAIRE_STATUS_LABELS,
} from "@/features/questionnaires/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EditQuestionnaireButton } from "@/features/questionnaires/components/EditQuestionnaireButton";
import { DeleteQuestionnaireButton } from "@/features/questionnaires/components/DeleteQuestionnaireButton";
import { QuestionsEditor } from "@/features/questionnaires/components/QuestionsEditor";
import styles from "@/components/layout/AdminShell.module.css";

export default async function QuestionnaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const questionnaire = await getQuestionnaire(user.workspaceId, id);
  if (!questionnaire) notFound();

  const [contacts, templates] = await Promise.all([
    listContacts(user.workspaceId),
    listTemplatesByType(user.workspaceId, "QUESTIONNAIRE"),
  ]);

  return (
    <>
      <Topbar
        title={questionnaire.name}
        subtitle="Questionnaire details"
        actions={
          <>
            <EditQuestionnaireButton
              questionnaire={questionnaire}
              contacts={contacts.map((c) => ({ id: c.id, fullName: c.fullName, clientId: c.clientId }))}
              templates={templates}
            />
            <DeleteQuestionnaireButton questionnaireId={questionnaire.id} clientId={questionnaire.clientId} />
          </>
        }
      />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/questionnaires"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to questionnaires
          </Link>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <Badge variant={QUESTIONNAIRE_STATUS_BADGE_VARIANT[questionnaire.status]}>
              {QUESTIONNAIRE_STATUS_LABELS[questionnaire.status]}
            </Badge>
          </div>

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-5)",
              marginBottom: "var(--space-6)",
            }}
          >
            <Field
              label="Client"
              value={questionnaire.client.name}
              href={`/admin/clients/${questionnaire.client.id}`}
            />
            <Field label="Contact" value={questionnaire.contact?.fullName} />
            <Field label="Template" value={questionnaire.template?.name} />
          </dl>

          <QuestionsEditor
            questionnaireId={questionnaire.id}
            questions={questionnaire.questions}
            template={questionnaire.template}
          />
        </Card>
      </div>
    </>
  );
}

function Field({ label, value, href }: { label: string; value?: string | null; href?: string }) {
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
      <dd style={{ fontSize: "var(--text-md)" }}>
        {value ? (
          href ? (
            <Link href={href} style={{ color: "var(--color-text)" }}>
              {value}
            </Link>
          ) : (
            value
          )
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
}
