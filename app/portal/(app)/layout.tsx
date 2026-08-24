import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { portalLogOutAction } from "@/features/portal-auth/actions";
import { PortalNav } from "@/components/layout/PortalNav";
import { WorkspaceTheme } from "@/components/layout/WorkspaceTheme";
import styles from "@/components/layout/AdminShell.module.css";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  return (
    <>
      <WorkspaceTheme
        colors={{
          backgroundColor: contact.workspaceBackgroundColor,
          accentColor: contact.workspaceAccentColor,
        }}
      />
      <div className={styles.shell}>
        <PortalNav
          workspaceName={contact.workspaceName}
          workspaceLogoUrl={contact.workspaceLogoUrl}
          contactName={contact.fullName}
          clientName={contact.clientName}
          onLogout={portalLogOutAction}
        />
        <div className={styles.main}>{children}</div>
      </div>
    </>
  );
}
