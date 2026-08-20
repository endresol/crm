import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listDeals } from "@/features/deals/service";
import { listClients } from "@/features/clients/service";
import { listContacts } from "@/features/contacts/service";
import { Topbar } from "@/components/layout/Topbar";
import { DealsPanel } from "@/features/deals/components/DealsPanel";
import styles from "@/components/layout/AdminShell.module.css";

export default async function DealsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [deals, clients, contacts] = await Promise.all([
    listDeals(user.workspaceId),
    listClients(user.workspaceId),
    listContacts(user.workspaceId),
  ]);

  return (
    <>
      <Topbar
        title="Deals"
        subtitle="View and manage your sales pipeline from here."
      />
      <div className={styles.content}>
        <DealsPanel
          deals={deals}
          clients={clients}
          contacts={contacts.map((contact) => ({
            id: contact.id,
            fullName: contact.fullName,
            clientId: contact.clientId,
          }))}
          dateFormat={user.workspaceDateFormat}
          defaultCurrency={user.workspaceCurrency}
        />
      </div>
    </>
  );
}
