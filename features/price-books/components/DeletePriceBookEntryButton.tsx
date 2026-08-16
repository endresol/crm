"use client";

import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/ui/icons";
import { deletePriceBookEntryAction } from "../actions";
import styles from "./DeletePriceBookEntryButton.module.css";

function SubmitIconButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Remove product pricing"
      className={styles.button}
    >
      <TrashIcon width={16} height={16} />
    </button>
  );
}

export function DeletePriceBookEntryButton({
  entryId,
  priceBookId,
}: {
  entryId: string;
  priceBookId: string;
}) {
  const boundAction = deletePriceBookEntryAction.bind(null, entryId, priceBookId);
  return (
    <form action={boundAction}>
      <SubmitIconButton />
    </form>
  );
}
