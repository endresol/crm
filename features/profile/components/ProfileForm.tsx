"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfileAction, type ProfileActionState } from "../actions";

const initialState: ProfileActionState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 480 }}
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

      <Input name="name" label="Full name" defaultValue={name} required />
      <Input name="email" type="email" label="Email" defaultValue={email} required />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state.success && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Saved</span>
        )}
      </div>
    </form>
  );
}
