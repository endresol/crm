import "server-only";

import { headers } from "next/headers";

/**
 * The current request's own origin, read from the `Host`/`X-Forwarded-Host`
 * headers rather than an env var to keep in sync — same reasoning
 * CopyLinkButton gives for using `window.location.origin` client-side
 * (features/meetings/components/CopyLinkButton.tsx), just the server-side
 * equivalent for places (an email body) that have no `window`. Works
 * unmodified in local dev, previews, and prod, and respects PORTAL_HOST/
 * custom domains since it reads whatever host the request actually came in
 * on rather than a single configured value.
 */
export async function getRequestBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto =
    headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
