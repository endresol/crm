"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ClientForm } from "./ClientForm";
import { updateClientAction } from "../actions";
import type { Client } from "@/generated/prisma/client";

export function EditClientButton({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateClientAction.bind(null, client.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit client">
        <ClientForm
          action={boundAction}
          defaultValues={client}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
