"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ContractForm } from "./ContractForm";
import { updateContractAction } from "../actions";
import type { Contract } from "@/generated/prisma/client";

export function EditContractButton({
  contract,
  contacts,
  deals,
  templates,
}: {
  contract: Contract;
  contacts: { id: string; fullName: string; clientId: string }[];
  deals: { id: string; name: string; clientId: string }[];
  templates: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateContractAction.bind(null, contract.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit contract">
        <ContractForm
          action={boundAction}
          fixedClientId={contract.clientId}
          contacts={contacts}
          deals={deals}
          templates={templates}
          defaultValues={contract}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
