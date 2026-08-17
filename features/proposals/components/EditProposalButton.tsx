"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ProposalForm } from "./ProposalForm";
import { updateProposalAction } from "../actions";
import type { Proposal } from "@/generated/prisma/client";

export function EditProposalButton({
  proposal,
  contacts,
  templates,
  workspaceName,
}: {
  proposal: Proposal;
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string; content: string }[];
  workspaceName: string;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateProposalAction.bind(null, proposal.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit proposal">
        <ProposalForm
          action={boundAction}
          fixedClientId={proposal.clientId}
          contacts={contacts}
          templates={templates}
          workspaceName={workspaceName}
          defaultValues={proposal}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
