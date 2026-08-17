import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listTeamMembers } from "@/features/team-members/service";
import { Topbar } from "@/components/layout/Topbar";
import { AddTeamMemberButton } from "@/features/team-members/components/AddTeamMemberButton";
import { TeamTable } from "@/features/team-members/components/TeamTable";
import styles from "@/components/layout/AdminShell.module.css";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const members = await listTeamMembers(user.workspaceId);

  return (
    <>
      <Topbar
        title="Team"
        subtitle="Manage who has access to this workspace."
        actions={<AddTeamMemberButton />}
      />
      <div className={styles.content}>
        <TeamTable members={members} currentUserId={user.id} />
      </div>
    </>
  );
}
