"use client";

import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/ui/icons";
import { deleteTimeEntryAction } from "../actions";
import styles from "./DeleteTimeEntryButton.module.css";

function SubmitIconButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Delete time entry" className={styles.button}>
      <TrashIcon width={16} height={16} />
    </button>
  );
}

export function DeleteTimeEntryButton({
  entryId,
  clientId,
}: {
  entryId: string;
  clientId: string;
}) {
  const boundAction = deleteTimeEntryAction.bind(null, entryId, clientId);
  return (
    <form action={boundAction}>
      <SubmitIconButton />
    </form>
  );
}
