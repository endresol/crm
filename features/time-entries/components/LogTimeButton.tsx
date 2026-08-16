"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { LogTimeForm, type ClientForLogging } from "./LogTimeForm";

export function LogTimeButton({
  clients,
  fixedClientId,
  fixedProjectId,
  label = "Log time",
}: {
  clients: ClientForLogging[];
  fixedClientId?: string;
  fixedProjectId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        {label}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Log time">
        <LogTimeForm
          clients={clients}
          fixedClientId={fixedClientId}
          fixedProjectId={fixedProjectId}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
