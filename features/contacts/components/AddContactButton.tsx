"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { ContactForm } from "./ContactForm";
import { createContactAction } from "../actions";

export function AddContactButton({
  clients,
  fixedClientId,
  label = "Add contact",
}: {
  clients?: { id: string; name: string }[];
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
      <Drawer open={open} onClose={() => setOpen(false)} title="Add contact">
        <ContactForm
          action={createContactAction}
          clients={clients}
          fixedClientId={fixedClientId}
          submitLabel="Add contact"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
