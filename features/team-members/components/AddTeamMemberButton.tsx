"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { TeamMemberForm } from "./TeamMemberForm";

export function AddTeamMemberButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        Add team member
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add team member">
        <TeamMemberForm onSaved={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
