"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { InvoiceForm } from "./InvoiceForm";
import { createInvoiceAction } from "../actions";

export function AddInvoiceButton({
  clients,
  contacts,
  templates,
  workspaceName,
  fixedClientId,
  label = "Create invoice",
}: {
  clients?: { id: string; name: string; email?: string | null }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string; content: string }[];
  workspaceName: string;
  fixedClientId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        {label}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Create invoice">
        <InvoiceForm
          action={createInvoiceAction}
          clients={clients}
          contacts={contacts}
          templates={templates}
          workspaceName={workspaceName}
          fixedClientId={fixedClientId}
          submitLabel="Create invoice"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
