"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { deleteQuestionnaireAction } from "../actions";

function ConfirmSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" size="sm" disabled={pending}>
      {pending ? "Deleting…" : "Yes, delete"}
    </Button>
  );
}

export function DeleteQuestionnaireButton({
  questionnaireId,
  clientId,
}: {
  questionnaireId: string;
  clientId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const boundAction = deleteQuestionnaireAction.bind(null, questionnaireId, clientId);

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Delete
      </Button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        Delete this questionnaire?
      </span>
      <form action={boundAction}>
        <ConfirmSubmitButton />
      </form>
      <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
