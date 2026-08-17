"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/icons";
import { createSopAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <PlusIcon width={16} height={16} />
      {pending ? "Creating…" : "Create SOP"}
    </Button>
  );
}

export function CreateSopButton() {
  return (
    <form action={createSopAction}>
      <SubmitButton />
    </form>
  );
}
