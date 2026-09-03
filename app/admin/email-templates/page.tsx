import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listEmailTemplates } from "@/features/email-templates/service";
import { Topbar } from "@/components/layout/Topbar";
import { EmailTemplatesPanel } from "@/features/email-templates/components/EmailTemplatesPanel";
import styles from "@/components/layout/AdminShell.module.css";

export default async function EmailTemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const templates = await listEmailTemplates(user.workspaceId);

  return (
    <>
      <Topbar
        title="Email Templates"
        subtitle="Reusable subject + message content for Invoices, Proposals, Contracts, Questionnaires, Meetings, and Client Portal invites."
      />
      <div className={styles.content}>
        <EmailTemplatesPanel templates={templates} />
      </div>
    </>
  );
}
