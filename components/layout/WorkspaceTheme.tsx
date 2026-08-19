import { workspaceThemeCss, type WorkspaceColors } from "@/lib/theme";

/**
 * Applies a workspace's branding colors by overriding the design tokens at
 * `:root`. Rendered inside the admin layout so it covers every admin page,
 * including `body` (which reads --color-bg in app/styles/reset.css and so
 * can't be re-themed from a wrapper element).
 *
 * This wins over app/styles/tokens.css despite equal specificity because it
 * comes later in document order. Injecting via a <style> tag rather than
 * inline styles is what lets it reach `body` and pseudo-elements at all.
 *
 * The interpolated string is safe to render unescaped: every value comes from
 * workspaceThemeVars, which only ever emits `#rrggbb` literals it built itself
 * from a strictly-validated parse — a stored color that isn't valid hex yields
 * no declaration rather than passing text through.
 */
export function WorkspaceTheme({ colors }: { colors: WorkspaceColors }) {
  const css = workspaceThemeCss(colors);
  if (!css) return null;

  return <style dangerouslySetInnerHTML={{ __html: `:root { ${css} }` }} />;
}
