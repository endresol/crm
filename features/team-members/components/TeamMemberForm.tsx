"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createTeamMemberAction, type TeamMemberActionState } from "../actions";
import { TEAM_ROLES } from "../schemas";
import { ROLE_LABELS } from "../constants";

const initialState: TeamMemberActionState = {};

export function TeamMemberForm({ onSaved, onCancel }: { onSaved?: () => void; onCancel?: () => void }) {
  const [state, formAction, pending] = useActionState(createTeamMemberAction, initialState);

  useEffect(() => {
    if (state.success && onSaved) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} style={{ display: "contents" }}>
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

      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        There&rsquo;s no email-invite system in this build — set a password here and share it
        with them directly.
      </p>

      <Input name="name" label="Name" required />
      <Input name="email" type="email" label="Email" required />
      <Input name="password" type="password" label="Password" helpText="At least 8 characters." required />

      <Select name="role" label="Role" defaultValue="MEMBER">
        {TEAM_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </Select>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add team member"}
        </Button>
      </div>
    </form>
  );
}
