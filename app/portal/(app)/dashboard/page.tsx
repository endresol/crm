import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { listProjectsForClient } from "@/features/projects/service";
import { listQuestionnairesForContact } from "@/features/questionnaires/service";
import { questionnaireProgress } from "@/features/questionnaires/constants";
import { PROJECT_STATUS_BADGE_VARIANT, PROJECT_STATUS_LABELS } from "@/features/projects/constants";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PortalDashboardPage() {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  const [projects, questionnaires] = await Promise.all([
    listProjectsForClient(contact.workspaceId, contact.clientId),
    listQuestionnairesForContact(contact.workspaceId, contact.clientId),
  ]);

  const openQuestionnaires = questionnaires.filter((q) => q.status !== "COMPLETED");

  return (
    <>
      <Topbar title={`Welcome back, ${contact.fullName}`} subtitle={`${contact.clientName}'s portal`} />
      <div className={styles.content}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-6)",
          }}
        >
          <StatTile label="Projects" value={projects.length} />
          <StatTile label="Open questionnaires" value={openQuestionnaires.length} />
        </div>

        <Card>
          <CardHeader
            title="Projects"
            subtitle={`${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
            action={
              <Link href="/portal/projects" style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                View all
              </Link>
            }
          />
          {projects.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              No projects yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{project.name}</span>
                  <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardHeader
              title="Questionnaires"
              subtitle={`${openQuestionnaires.length} open`}
              action={
                <Link href="/portal/questionnaires" style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                  View all
                </Link>
              }
            />
            {questionnaires.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No questionnaires yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {questionnaires.slice(0, 5).map((questionnaire) => {
                  const { answered, total } = questionnaireProgress(questionnaire.questions ?? []);
                  return (
                    <Link
                      key={questionnaire.id}
                      href={`/portal/questionnaires/${questionnaire.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{questionnaire.name}</span>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                        {questionnaire.status === "COMPLETED" ? "Completed" : `${answered} of ${total} answered`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginTop: "var(--space-1)" }}>{value}</div>
    </Card>
  );
}
