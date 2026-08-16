"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { DealForm } from "./DealForm";
import { createDealAction } from "../actions";

export function AddDealButton({
  fixedClientId,
  contacts,
  label = "New deal",
}: {
  fixedClientId: string;
  contacts: { id: string; fullName: string; clientId: string }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        {label}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="New deal">
        <DealForm
          action={createDealAction}
          fixedClientId={fixedClientId}
          contacts={contacts}
          submitLabel="Create deal"
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
