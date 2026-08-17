"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS, TIMEZONE_OPTIONS } from "../constants";
import { updateWorkspaceSettingsAction, type WorkspaceSettingsActionState } from "../actions";
import type { Workspace } from "@/generated/prisma/client";

const initialState: WorkspaceSettingsActionState = {};

export function SettingsForm({ workspace }: { workspace: Workspace }) {
  const [state, formAction, pending] = useActionState(updateWorkspaceSettingsAction, initialState);

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

      <Input name="name" label="Workspace name" defaultValue={workspace.name} required />

      <Select name="timezone" label="Timezone" defaultValue={workspace.timezone}>
        {TIMEZONE_OPTIONS.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </Select>

      <Select name="currency" label="Default currency" defaultValue={workspace.currency}>
        {CURRENCY_OPTIONS.map((currency) => (
          <option key={currency.value} value={currency.value}>
            {currency.label}
          </option>
        ))}
      </Select>

      <Select name="dateFormat" label="Date format" defaultValue={workspace.dateFormat}>
        {DATE_FORMAT_OPTIONS.map((format) => (
          <option key={format.value} value={format.value}>
            {format.label}
          </option>
        ))}
      </Select>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            htmlFor="backgroundColor"
            style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)" }}
          >
            Background color
          </label>
          <input
            id="backgroundColor"
            name="backgroundColor"
            type="color"
            defaultValue={workspace.backgroundColor}
            style={{ width: 64, height: 36, padding: 0, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            htmlFor="accentColor"
            style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)" }}
          >
            Accent color
          </label>
          <input
            id="accentColor"
            name="accentColor"
            type="color"
            defaultValue={workspace.accentColor}
            style={{ width: 64, height: 36, padding: 0, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
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
