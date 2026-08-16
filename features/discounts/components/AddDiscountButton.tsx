"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { DiscountForm } from "./DiscountForm";

export function AddDiscountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        Add discount
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add discount">
        <DiscountForm onSaved={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
