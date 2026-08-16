"use client";

import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/ui/icons";
import { deleteProductAction } from "../actions";
import styles from "./DeleteProductButton.module.css";

function SubmitIconButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Delete product" className={styles.button}>
      <TrashIcon width={16} height={16} />
    </button>
  );
}

export function DeleteProductButton({ productId }: { productId: string }) {
  const boundAction = deleteProductAction.bind(null, productId);
  return (
    <form action={boundAction}>
      <SubmitIconButton />
    </form>
  );
}
