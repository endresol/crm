import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listLeads } from "@/features/leads/service";
import { Topbar } from "@/components/layout/Topbar";
import { LeadsPanel } from "@/features/leads/components/LeadsPanel";
import styles from "@/components/layout/AdminShell.module.css";

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leads = await listLeads(user.workspaceId);

  return (
    <>
      <Topbar title="Leads" subtitle="Track the progress of your leads." />
      <div className={styles.content}>
        <LeadsPanel leads={leads} />
      </div>
    </>
  );
}
