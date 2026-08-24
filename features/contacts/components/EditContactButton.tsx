"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ContactForm } from "./ContactForm";
import { updateContactAction } from "../actions";

// Deliberately narrower than the full Contact model (no portalPasswordHash,
// etc.) — see features/contacts/service.ts's SAFE_SELECT for why. Whatever
// shape `contact` has here is what crosses into this Client Component.
type EditableContact = {
  id: string;
  clientId: string;
  fullName: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
};

export function EditContactButton({ contact }: { contact: EditableContact }) {
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
