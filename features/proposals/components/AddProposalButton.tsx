"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { ProposalForm } from "./ProposalForm";
import { createProposalAction } from "../actions";

export function AddProposalButton({
  clients,
  contacts,
  templates,
  workspaceName,
  defaultCurrency,
  fixedClientId,
  label = "Add Proposal",
}: {
  clients?: { id: string; name: string; email?: string | null }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string; content: string }[];
  workspaceName: string;
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
      <Drawer open={open} onClose={() => setOpen(false)} title="Create proposal">
        <ProposalForm
          action={createProposalAction}
          clients={clients}
          contacts={contacts}
          templates={templates}
          workspaceName={workspaceName}
          defaultCurrency={defaultCurrency}
          fixedClientId={fixedClientId}
          submitLabel="Create proposal"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
