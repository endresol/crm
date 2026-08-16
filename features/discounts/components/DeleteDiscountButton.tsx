"use client";

import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/ui/icons";
import { deleteDiscountAction } from "../actions";
import styles from "./DeleteDiscountButton.module.css";

function SubmitIconButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Delete discount" className={styles.button}>
      <TrashIcon width={16} height={16} />
    </button>
  );
}

export function DeleteDiscountButton({ discountId }: { discountId: string }) {
  const boundAction = deleteDiscountAction.bind(null, discountId);
  return (
    <form action={boundAction}>
      <SubmitIconButton />
    </form>
  );
}
