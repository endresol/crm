import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { getQuestionnaireForContact } from "@/features/questionnaires/service";
import {
  QUESTIONNAIRE_STATUS_BADGE_VARIANT,
  QUESTIONNAIRE_STATUS_LABELS,
} from "@/features/questionnaires/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PortalQuestionnaireForm } from "@/features/questionnaires/components/PortalQuestionnaireForm";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PortalQuestionnaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const { id } = await params;
  const questionnaire = await getQuestionnaireForContact(contact.workspaceId, contact.clientId, id);
  if (!questionnaire) notFound();

  return (
    <>
      <Topbar title={questionnaire.name} subtitle="Questionnaire" />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/portal/questionnaires"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to questionnaires
          </Link>
        </div>

        <Card>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <Badge variant={QUESTIONNAIRE_STATUS_BADGE_VARIANT[questionnaire.status]}>
              {QUESTIONNAIRE_STATUS_LABELS[questionnaire.status]}
            </Badge>
          </div>

          {questionnaire.questions.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              There&apos;s nothing to fill out here yet.
            </p>
          ) : (
            <PortalQuestionnaireForm
              questionnaireId={questionnaire.id}
              questions={questionnaire.questions}
              completed={questionnaire.status === "COMPLETED"}
            />
          )}
        </Card>
      </div>
    </>
  );
}
