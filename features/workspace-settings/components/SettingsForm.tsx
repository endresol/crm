"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { workspaceThemeVars } from "@/lib/theme";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  TIMEZONE_OPTIONS,
} from "../constants";
import { updateWorkspaceSettingsAction, type WorkspaceSettingsActionState } from "../actions";
import type { Workspace } from "@/generated/prisma/client";

const initialState: WorkspaceSettingsActionState = {};

export function SettingsForm({ workspace }: { workspace: Workspace }) {
  const [state, formAction, pending] = useActionState(updateWorkspaceSettingsAction, initialState);
  const [backgroundColor, setBackgroundColor] = useState(workspace.backgroundColor);
  const [accentColor, setAccentColor] = useState(workspace.accentColor);

  // Live preview: push the same custom properties the server renders (see
  // components/layout/WorkspaceTheme.tsx) straight onto :root as the swatches
  // change, so picking a color re-themes the surrounding app immediately
  // instead of only after saving. Cleared on unmount so navigating away
  // without saving doesn't leave an unsaved theme applied.
  useEffect(() => {
    const root = document.documentElement;
    const vars = workspaceThemeVars({ backgroundColor, accentColor });
    for (const [property, value] of Object.entries(vars)) {
      root.style.setProperty(property, value);
    }
    return () => {
      for (const property of Object.keys(vars)) {
        root.style.removeProperty(property);
      }
    };
  }, [backgroundColor, accentColor]);

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

      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-4)" }}>
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
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
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
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            style={{ width: 64, height: 36, padding: 0, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
          />
        </div>
        {/* Resets the pickers (and the live preview via them) back to the
            product default — still requires Save, same as any other field
            here, so it can't accidentally overwrite a saved custom color. */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
            setAccentColor(DEFAULT_ACCENT_COLOR);
          }}
        >
          Reset to default
        </Button>
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
