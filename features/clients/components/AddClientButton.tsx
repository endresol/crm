"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { ClientForm } from "./ClientForm";
import { createClientAction } from "../actions";

export function AddClientButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        Add client
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add client">
        <ClientForm action={createClientAction} submitLabel="Add client" onCancel={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
