import { redirect } from "next/navigation";

// A bare landing spot for "/portal" (e.g. the portal host's "/" after
// proxy.ts rewrites it here) — the (app) route group's layout is what
// actually decides dashboard vs. login based on the session.
export default function PortalIndexPage() {
  redirect("/portal/dashboard");
}
