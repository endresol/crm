"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { InvoiceForm } from "./InvoiceForm";
import { updateInvoiceAction } from "../actions";
import type { Invoice } from "@/generated/prisma/client";

export function EditInvoiceButton({
  invoice,
  contacts,
  templates,
  workspaceName,
}: {
  invoice: Invoice;
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string; content: string }[];
  workspaceName: string;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateInvoiceAction.bind(null, invoice.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit invoice">
        <InvoiceForm
          action={boundAction}
          fixedClientId={invoice.clientId}
          contacts={contacts}
          templates={templates}
          workspaceName={workspaceName}
          defaultValues={invoice}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
