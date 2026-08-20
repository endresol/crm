"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { ContractForm } from "./ContractForm";
import { createContractAction } from "../actions";

export function AddContractButton({
  clients,
  contacts,
  deals,
  templates,
  defaultCurrency,
  fixedClientId,
  label = "Add Contract",
}: {
  clients?: { id: string; name: string }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  deals: { id: string; name: string; clientId: string }[];
  templates: { id: string; name: string }[];
  defaultCurrency?: string;
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
      <Drawer open={open} onClose={() => setOpen(false)} title="Create contract">
        <ContractForm
          action={createContractAction}
          clients={clients}
          contacts={contacts}
          deals={deals}
          templates={templates}
          defaultCurrency={defaultCurrency}
          fixedClientId={fixedClientId}
          submitLabel="Create contract"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
