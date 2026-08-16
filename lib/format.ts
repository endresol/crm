// Date formatting helpers used across the app. Always pass an explicit locale
// to Intl/toLocaleDateString — leaving it out uses the runtime's default
// locale, which differs between the Node.js server (SSR) and the browser
// (client), and causes React hydration mismatches ("server rendered text
// didn't match the client"). Pinning a fixed locale keeps every render
// identical regardless of where it runs. (Swap this for real i18n later if
// the app ever needs to respect a user's locale preference.)

const LOCALE = "en-US";

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(LOCALE, { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatMonthShort(value: Date): string {
  return value.toLocaleDateString(LOCALE, { month: "short" });
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(value);
}
