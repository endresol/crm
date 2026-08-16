"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ProductForm } from "./ProductForm";
import { updateProductAction } from "../actions";
import type { Product } from "@/generated/prisma/client";

export function EditProductButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit product">
        <ProductForm
          action={boundAction}
          defaultValues={product}
          submitLabel="Save changes"
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
