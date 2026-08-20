"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { PriceBookEntryForm } from "./PriceBookEntryForm";

export function AddPriceBookEntryButton({
  priceBookId,
  products,
  defaultCurrency,
}: {
  priceBookId: string;
  products: { id: string; name: string; code: string }[];
  defaultCurrency?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        Add product pricing
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add product pricing">
        <PriceBookEntryForm
          priceBookId={priceBookId}
          products={products}
          defaultCurrency={defaultCurrency}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
