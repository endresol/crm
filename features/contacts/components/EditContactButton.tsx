"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ContactForm } from "./ContactForm";
import { updateContactAction } from "../actions";
import type { Contact } from "@/generated/prisma/client";

export function EditContactButton({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateContactAction.bind(null, contact.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit contact">
        <ContactForm
          action={boundAction}
          fixedClientId={contact.clientId}
          defaultValues={contact}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
