"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ScheduleForm } from "./ScheduleForm";
import { updateScheduleAction } from "../actions";
import type { MeetingSchedule } from "@/generated/prisma/client";

export function EditScheduleButton({ schedule }: { schedule: MeetingSchedule }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateScheduleAction.bind(null, schedule.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit schedule">
        <ScheduleForm
          action={boundAction}
          defaultValues={schedule}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
