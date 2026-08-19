"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePasswordAction, type ProfileActionState } from "../actions";

const initialState: ProfileActionState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields once the change lands — leaving a password sitting in the
  // DOM after a successful submit serves no purpose.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
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

      <Input
        name="currentPassword"
        type="password"
        label="Current password"
        autoComplete="current-password"
        required
      />
      <Input
        name="newPassword"
        type="password"
        label="New password"
        autoComplete="new-password"
        helpText="At least 8 characters."
        required
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        required
      />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
        {state.success && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            Password updated
          </span>
        )}
      </div>
    </form>
  );
}
