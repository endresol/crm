"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { updateSopAction, type SopActionState } from "../actions";
import type { Sop } from "@/generated/prisma/client";

const initialState: SopActionState = {};

export function SopEditor({ sop }: { sop: Sop }) {
  const boundAction = updateSopAction.bind(null, sop.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      {state.error && (
        <div
          style={{
            background: "var(--color-danger-soft)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            fontSize: "var(--text-sm)",
          }}
        >
          {state.error}
        </div>
      )}

      <Input name="title" label="Title" defaultValue={sop.title} />

      <Textarea name="content" label="Content" rows={24} defaultValue={sop.content} />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {state.success && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
