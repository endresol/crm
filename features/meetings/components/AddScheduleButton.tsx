"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { ScheduleForm } from "./ScheduleForm";
import { createScheduleAction } from "../actions";

export function AddScheduleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        Create Schedule
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Create meeting schedule">
        <ScheduleForm
          action={createScheduleAction}
          submitLabel="Create schedule"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
