import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listTemplates } from "@/features/document-templates/service";
import { Topbar } from "@/components/layout/Topbar";
import { TemplatesPanel } from "@/features/document-templates/components/TemplatesPanel";
import styles from "@/components/layout/AdminShell.module.css";

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const templates = await listTemplates(user.workspaceId);

  return (
    <>
      <Topbar
        title="Templates"
        subtitle="Reusable content for Invoices, Proposals, Contracts, and Questionnaires."
      />
      <div className={styles.content}>
        <TemplatesPanel templates={templates} />
      </div>
    </>
  );
}
