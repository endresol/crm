// Turns the two colors a workspace can pick (backgroundColor/accentColor, see
// roadmap #6) into the full set of CSS custom properties the design tokens
// expose. No imports, so both Server Components and a client-side live preview
// in the settings form can share it — same split as
// features/document-templates/mergeFields.ts.
//
// Only the two picked colors are stored; every other shade (accent hover/
// active/soft, and the text color that sits on top of the accent) is derived
// here. Storing derived shades would mean the settings form had to ask for six
// colors instead of two, and they could drift out of sync with each other.

export type WorkspaceColors = {
  backgroundColor: string;
  accentColor: string;
};

type Rgb = { r: number; g: number; b: number };

/** Parses #rgb / #rrggbb. Returns null for anything else, so callers fall back
 * to the static token defaults rather than emitting broken CSS. */
function parseHex(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** `amount` > 0 lightens toward white, < 0 darkens toward black. */
function shift(rgb: Rgb, amount: number): Rgb {
  const target = amount > 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  return {
    r: rgb.r + (target - rgb.r) * ratio,
    g: rgb.g + (target - rgb.g) * ratio,
    b: rgb.b + (target - rgb.b) * ratio,
  };
}

/** Perceived brightness (ITU-R BT.601), used to decide whether text on top of
 * the accent should be white or near-black. A pale accent with white text on it
 * is the one combination that becomes genuinely unreadable. */
function luminance({ r, g, b }: Rgb): number {
  return (r * 299 + g * 587 + b * 114) / 1000 / 255;
}

/**
 * Builds the CSS custom property overrides for a workspace's colors.
 * Returns only the properties that differ from the static defaults in
 * app/styles/tokens.css — an unparseable color simply yields no override.
 */
export function workspaceThemeVars(colors: WorkspaceColors): Record<string, string> {
  const vars: Record<string, string> = {};

  const bg = parseHex(colors.backgroundColor);
  if (bg) {
    vars["--color-bg"] = toHex(bg);
    // The sidebar and empty-table surfaces sit directly on the page background;
    // nudging them keeps them distinguishable when the background is dark.
    vars["--color-surface-hover"] = toHex(shift(bg, luminance(bg) > 0.5 ? 0.45 : -0.15));
  }

  const accent = parseHex(colors.accentColor);
  if (accent) {
    vars["--color-primary"] = toHex(accent);
    vars["--color-primary-hover"] = toHex(shift(accent, -0.12));
    vars["--color-primary-active"] = toHex(shift(accent, -0.24));
    vars["--color-primary-soft"] = toHex(shift(accent, 0.88));
    vars["--color-primary-soft-text"] = toHex(shift(accent, -0.15));
    vars["--color-text-on-primary"] = luminance(accent) > 0.6 ? "#16151f" : "#ffffff";
  }

  return vars;
}

/** Serializes the overrides as a CSS declaration list for a `style` attribute
 * or a `:root`-scoped rule. Returns "" when there's nothing to override. */
export function workspaceThemeCss(colors: WorkspaceColors): string {
  return Object.entries(workspaceThemeVars(colors))
    .map(([property, value]) => `${property}: ${value};`)
    .join(" ");
}
